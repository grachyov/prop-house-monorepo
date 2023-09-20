import classes from './ProposalCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import detailedTime from '../../utils/detailedTime';
import clsx from 'clsx';
import diffTime from '../../utils/diffTime';
import EthAddress from '../EthAddress';
import ReactMarkdown from 'react-markdown';
import VotesDisplay from '../VotesDisplay';
import { useAppSelector } from '../../hooks';
import { useDispatch } from 'react-redux';
import { setActiveProposal, setModalActive } from '../../state/slices/propHouse';
import Divider from '../Divider';
import getFirstImageFromProp from '../../utils/getFirstImageFromProp';
import { useEffect, useState } from 'react';
import { isMobile } from 'web3modal';
import TimedRoundVotingControls from '../TimedRoundVotingControls';
import { replaceIpfsGateway } from '../../utils/ipfs';
import { Proposal, RoundState } from '@prophouse/sdk-react';

const TimedRoundProposalCard: React.FC<{
  proposal: Proposal;
  roundState: RoundState;
  isWinner: boolean;
}> = props => {
  const { proposal, roundState, isWinner } = props;

  const dispatch = useDispatch();

  const roundIsActive =
    roundState === RoundState.IN_PROPOSING_PERIOD || roundState === RoundState.IN_VOTING_PERIOD;
  const roundEnded = roundState > RoundState.IN_VOTING_PERIOD;
  const showVoteDisplay = roundState >= RoundState.IN_VOTING_PERIOD;

  const showVoteControls = roundState === RoundState.IN_VOTING_PERIOD;

  const [imgUrlFromProp, setImgUrlFromProp] = useState<string | undefined>(undefined);
  const [displayTldr, setDisplayTldr] = useState<boolean | undefined>();

  useEffect(() => {
    let imgUrl;

    const getImg = async () => {
      imgUrl = await getFirstImageFromProp(proposal);
      setImgUrlFromProp(imgUrl);
      setDisplayTldr(!isMobile() || (isMobile() && !imgUrl));
    };
    getImg();
  }, [proposal]);

  return (
    <>
      <div
        onClick={e => {
          dispatch(setModalActive(true));
          dispatch(setActiveProposal(proposal));
        }}
      >
        <Card
          bgColor={CardBgColor.White}
          borderRadius={CardBorderRadius.thirty}
          classNames={clsx(classes.proposalCard, isWinner && roundEnded && classes.winner)}
        >
          <div className={classes.propInfo}>
            <div className={classes.textContainter}>
              <div>
                <div className={classes.titleContainer}>
                  {isWinner && (
                    <div className={classes.crownNoun}>
                      <img src="/heads/crown.png" alt="crown" />
                    </div>
                  )}
                  <div className={classes.propTitle}>{proposal.title}</div>
                </div>

                {displayTldr && (
                  <ReactMarkdown
                    className={classes.truncatedTldr}
                    children={'proposal.tldr'}
                    disallowedElements={['img', '']}
                    components={{
                      h1: 'p',
                      h2: 'p',
                      h3: 'p',
                    }}
                  />
                )}
              </div>
            </div>

            {imgUrlFromProp && (
              <div className={classes.propImgContainer}>
                <img
                  src={replaceIpfsGateway(imgUrlFromProp)}
                  crossOrigin="anonymous"
                  alt="propCardImage"
                />
              </div>
            )}
          </div>

          <Divider />

          <div className={classes.submissionInfoContainer}>
            <div className={classes.addressAndTimestamp}>
              <EthAddress address={proposal.proposer} className={classes.truncate} addAvatar />

              <span className={clsx(classes.bullet, roundIsActive && classes.hideDate)}>
                {' • '}
              </span>

              <div
                className={clsx(classes.date, roundIsActive && classes.hideDate)}
                title={detailedTime(new Date(proposal.receivedAt))}
              >
                {diffTime(new Date(proposal.receivedAt))}
              </div>
            </div>
            <div className={classes.timestampAndlinkContainer}>
              <div className={clsx(classes.avatarAndPropNumber)}>
                <div
                  className={classes.voteCountCopy}
                  title={detailedTime(new Date(proposal.receivedAt))}
                >
                  {showVoteDisplay && <VotesDisplay proposal={proposal} />}

                  {roundState === RoundState.IN_VOTING_PERIOD && (
                    <div className={classes.votingArrows}>
                      <span className={classes.plusArrow}>+</span>
                      {/* <TimedRoundVotingControls proposal={proposal} /> */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default TimedRoundProposalCard;
