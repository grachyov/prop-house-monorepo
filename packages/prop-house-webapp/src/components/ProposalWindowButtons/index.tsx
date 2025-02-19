import classes from './ProposalWindowButtons.module.css';
import Button, { ButtonColor } from '../Button';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { isSameAddress } from '../../utils/isSameAddress';
import { clearProposal } from '../../state/slices/editor';
import { isValidPropData } from '../../utils/isValidPropData';
import { isInfAuction } from '../../utils/auctionType';
import { useAccount } from 'wagmi';
import useProposalGrants from '../../hooks/useProposalGrants';

/**
 * New, Edit and Delete buttons
 */
const ProposalWindowButtons: React.FC<{
  proposal: StoredProposalWithVotes;
  editProposalMode: boolean;
  setEditProposalMode: (e: any) => void;
  setShowSavePropModal: (e: any) => void;
  setShowDeletePropModal: (e: any) => void;
}> = props => {
  const {
    proposal,
    editProposalMode,
    setEditProposalMode,
    setShowSavePropModal,
    setShowDeletePropModal,
  } = props;

  const { address: account } = useAccount();

  const navigate = useNavigate();
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.activeRound);
  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const proposalEditorData = useAppSelector(state => state.editor.proposal);
  const dispatch = useAppDispatch();

  const [loadingCanPropose, canPropose] = useProposalGrants(round!, account);

  return (
    <>
      {/* MY PROP */}
      {account &&
        (isSameAddress(proposal.address, account) ? (
          <div className={classes.proposalWindowButtons}>
            {editProposalMode && round ? (
              <>
                <div></div>
                <div className={classes.editModeButtons}>
                  <Button
                    classNames={classes.fullWidthButton}
                    text={'Cancel'}
                    bgColor={ButtonColor.Gray}
                    onClick={() => setEditProposalMode(false)}
                  />

                  <Button
                    classNames={classes.fullWidthButton}
                    text={'Save'}
                    bgColor={ButtonColor.Purple}
                    onClick={() => setShowSavePropModal(true)}
                    disabled={!isValidPropData(isInfAuction(round), proposalEditorData)}
                  />
                </div>
              </>
            ) : (
              <>
                <Button
                  classNames={classes.fullWidthButton}
                  text={
                    loadingCanPropose ? (
                      <div>Checking for account requirements...</div>
                    ) : canPropose && !loadingCanPropose ? (
                      'Create your proposal'
                    ) : (
                      'Your account is not eligible to submit a proposal'
                    )
                  }
                  bgColor={loadingCanPropose || !canPropose ? ButtonColor.Gray : ButtonColor.Green}
                  onClick={() => {
                    dispatch(clearProposal());
                    navigate('/create', { state: { auction: round, community, proposals } });
                  }}
                  disabled={!canPropose}
                />

                <div className={classes.editModeButtons}>
                  <Button
                    classNames={classes.fullWidthButton}
                    text={'Delete'}
                    bgColor={ButtonColor.Red}
                    onClick={() => setShowDeletePropModal(true)}
                  />

                  <Button
                    classNames={classes.fullWidthButton}
                    text={'Edit Prop'}
                    bgColor={ButtonColor.Purple}
                    onClick={() => setEditProposalMode(true)}
                  />
                </div>
              </>
            )}
          </div>
        ) : (
          // NOT MY PROP
          <Button
            classNames={classes.fullWidthButton}
            text={
              loadingCanPropose ? (
                <div>Checking for account requirements...</div>
              ) : canPropose && !loadingCanPropose ? (
                'Create your proposal'
              ) : (
                'Your account is not eligible to submit a proposal'
              )
            }
            bgColor={loadingCanPropose || !canPropose ? ButtonColor.Gray : ButtonColor.Green}
            onClick={() => {
              dispatch(clearProposal());
              navigate('/create', { state: { auction: round, community, proposals } });
            }}
            disabled={!canPropose}
          />
        ))}
    </>
  );
};

export default ProposalWindowButtons;
