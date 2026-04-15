import { title } from 'process';
import { fetchValidators, Validator } from '../validators';
import { Message, MessageType } from "./messages"

const INACTIVITY_THRESHOLD_HOURS = parseInt(process.env.INACTIVITY_THRESHOLD_HOURS) || 0.01;


const createInactiveValidatorMessage = (validator: Validator, inactiveSince: string, lastActivityUTC: string) =>{
  return{
    title: `Inactive validator alert: ${validator.name} on ${validator.bridgeType}`,
    type: MessageType.INACTIVE_VALIDATOR,
    createdBy: validator.name,
    createdByLink: `https://gnosisscan.io/address/${validator.address}`,
    timestamp: new Date(),
    body: `Inactive since: ${inactiveSince}, last activity in ${lastActivityUTC}`
    
  }
}

export const checkInactiveValidators = async (): Promise<Message[] | null> => {
  console.log('Checking for inactive validators...');
  try {
    const allValidators = await fetchValidators();
    const now = Math.floor(Date.now() / 1000);
    const inactivityCutoff = now - INACTIVITY_THRESHOLD_HOURS * 60 * 60;

    const inactiveValidators = allValidators.filter(validator => {
      if (!validator.lastActivity) {
        return true; // Consider validators never seen as inactive
      }
      return parseInt(validator.lastActivity, 10) < inactivityCutoff;
    });

    if (inactiveValidators.length > 0) {
      console.log(`Found ${inactiveValidators.length} inactive validators.`);
      
        const message = inactiveValidators.map(( validator: Validator) => {
        
        // Calculate inactivity duration
        const diffInSeconds = now - parseInt(validator.lastActivity, 10);
        const diffInHours = Math.round(diffInSeconds / 3600);
        const hourText = diffInHours === 1 ? 'hr' : 'hrs';
        const inactiveSince = `${diffInHours} ${hourText} ago`;
        const lastActivityUTC = new Date(parseInt(validator.lastActivity, 10) * 1000).toUTCString()

        
        return createInactiveValidatorMessage(validator,inactiveSince, lastActivityUTC)
       
      });
      return message
     
      
   
    } else {
      console.log('All validators are active.');
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error('Could not check for inactive validators due to an error:', e.message);
    } else {
      console.error('An unknown error occurred while checking for inactive validators.');
    }
  }
  return null;
};
