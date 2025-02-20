export type Step = 'notStarted' | 'now' | 'pending' | 'done'
export type Steps = {
  approve: Step[]
  approving: Step[]
  swap: Step[]
  swapping: Step[]
  bridge: Step[]
  bridging: Step[]
  completed: Step[]
}

export const statuses = {
  approve: {
    notStarted: {
      title: '',
      text: '1. Approve',
      statusIcon: 'none',
    },
    now: {
      title: 'Confirm approval transaction in your wallet',
      text: '1. Approve',
      statusIcon: 'waiting',
    },
    pending: {
      title: 'Confirm approval transaction in your wallet',
      text: '1. Approve',
      statusIcon: 'pending',
    },
    done: {
      title: 'Approval confirmed',
      text: '1. Approved',
      statusIcon: 'success',
    },
  },
  swap: {
    notStarted: {
      title: 'Swapping',
      text: '2. Swap',
      statusIcon: 'none',
    },
    now: {
      title: 'Confirm swap transaction in your wallet',
      text: '2. Swap',
      statusIcon: 'waiting',
    },
    pending: {
      title: 'Confirm swap transaction in your wallet',
      text: '2. Swap',
      statusIcon: 'pending',
    },
    done: {
      title: 'Swap is executed',
      text: '2. Swapped',
      statusIcon: 'success',
    },
  },
  bridge: {
    notStarted: {
      title: 'Bridging',
      text: '3. Bridge',
      statusIcon: 'none',
    },
    now: {
      title: 'Confirm bridging transaction in your wallet',
      text: '3. Bridge',
      statusIcon: 'waiting',
    },
    pending: {
      title: 'Confirm bridging transaction in your wallet',
      text: '3. Bridge',
      statusIcon: 'pending',
    },
    done: {
      title: 'Bridging is initiated',
      text: '3. Bridge started',
      statusIcon: 'success',
    },
  },
}

export const steps: Steps = {
  approve: ['now', 'notStarted', 'notStarted'],
  approving: ['pending', 'notStarted', 'notStarted'],

  swap: ['done', 'now', 'notStarted'],
  swapping: ['done', 'pending', 'notStarted'],

  bridge: ['done', 'done', 'now'],
  bridging: ['done', 'done', 'pending'],

  completed: ['done', 'done', 'done'],
}
