import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './vote.entity';
import { CreateVoteDto } from './vote.types';
import { Proposal } from 'src/proposal/proposal.entity';
import { isDevEnv } from 'src/config/configuration';
import { ethers } from 'ethers';
import { DelegatedVotes, VoteType } from 'src/utils/vote';
import config from 'src/config/configuration';
import { getNumVotes } from 'prop-house-communities';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,
  ) {}

  async findAll(): Promise<Vote[]> {
    const proposals = await this.votesRepository.find();
    return proposals;
  }

  async findAllByAuctionId(auctionId: number): Promise<Vote[]> {
    return await this.votesRepository.find({ where: { auctionId } });
  }

  findOne(id: number): Promise<Vote> {
    return this.votesRepository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.votesRepository.delete(id);
  }

  async store(vote: Vote) {
    return this.votesRepository.save(vote);
  }

  async findByAddress(address: string) {
    return this.votesRepository.find({
      relations: ['proposal'],
      where: { address },
    });
  }

  async getNumVotes(dto: CreateVoteDto): Promise<number> {
    const provider = new ethers.providers.JsonRpcProvider(config().JSONRPC);
    return await getNumVotes(dto.address, dto.communityAddress, provider);
  }

  async createNewVote(
    createVoteDto: CreateVoteDto,
    proposal: Proposal,
    voteType: VoteType,
  ) {
    // Create vote for proposal
    const vote = new Vote();
    vote.address = createVoteDto.address;
    vote.proposal = proposal;
    vote.direction = createVoteDto.direction;
    vote.signedData = createVoteDto.signedData;
    vote.type = voteType;
    vote.auctionId = proposal.auctionId;
    vote.weight = createVoteDto.weight;

    // Store the new vote
    await this.store(vote);

    return vote;
  }
}
