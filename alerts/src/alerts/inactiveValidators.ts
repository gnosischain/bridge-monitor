import { fetchValidators } from '../validators';
import { Message } from './messages';

const INACTIVITY_THRESHOLD_HOURS = parseInt(process.env.INACTIVITY_THRESHOLD_HOURS) || 0.01;

export const checkInactiveValidators = async (): Promise<Message | null> => {
  console.log('Checking for inactive validators...');
  try {
    const allValidators = await fetchValidators();
    console.log("All validators ",allValidators )
    const now = Math.floor(Date.now() / 1000);
    const inactivityCutoff = now - INACTIVITY_THRESHOLD_HOURS * 60 * 60;

    const inactiveValidators = allValidators.filter(validator => {
      if (!validator.lastActivity) {
        return true; // Consider validators never seen as inactive
      }
      console.log(`${validator.address}: ${validator.lastActivity}`)
      return parseInt(validator.lastActivity, 10) < inactivityCutoff;
    });

    if (inactiveValidators.length > 0) {
      console.log(`Found ${inactiveValidators.length} inactive validators.`);
      
      // Define the type for the accumulator object for type safety
      type ValidatorInfo = { address: string; lastActivityUTC: string; 'Inactive Since': string; };

      // Create a JSON object with validator names as keys
      const inactiveValidatorsJson = inactiveValidators.reduce((acc: Record<string, ValidatorInfo>, validator) => {
        const name = validator.name || validator.id;

        // Calculate inactivity duration
        const diffInSeconds = now - parseInt(validator.lastActivity, 10);
        const diffInHours = Math.round(diffInSeconds / 3600);
        const hourText = diffInHours === 1 ? 'hr' : 'hrs';
        const inactiveSince = `${diffInHours} ${hourText} ago`;

        acc[name] = {
          address: validator.address,
          lastActivityUTC: new Date(parseInt(validator.lastActivity, 10) * 1000).toUTCString(),
          'Inactive Since': inactiveSince
        };
        return acc;
      }, {});

      // Format the JSON for the message body
      const jsonString = JSON.stringify(inactiveValidatorsJson, null, 2);
      const messageBody = `The following validators have been inactive for more than ${INACTIVITY_THRESHOLD_HOURS} hours:\n\
\
\
${jsonString}\
\
\
`;
      
      return {
        title: '🚨 Inactive Validators Alert',
        body: messageBody,
        type: 'InactiveValiadtor',
        createdBy: 'Bridge Monitor',
        createdByLink: ''
      };
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
