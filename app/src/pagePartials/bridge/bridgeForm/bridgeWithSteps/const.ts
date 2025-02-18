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
      text: 'Approve',
      statusIcon: 'none',
    },
    now: {
      title: 'Confirm approval transaction in your wallet',
      text: 'Approve',
      statusIcon: 'waiting',
    },
    pending: {
      title: 'Confirm approval transaction in your wallet',
      text: 'Approve',
      statusIcon: 'pending',
    },
    done: {
      title: 'Approval confirmed',
      text: 'Approved',
      statusIcon: 'success',
    },
  },
  swap: {
    notStarted: {
      title: 'Swapping',
      text: 'Swap',
      statusIcon: 'none',
    },
    now: {
      title: 'Confirm swap transaction in your wallet',
      text: 'Swap',
      statusIcon: 'waiting',
    },
    pending: {
      title: 'Confirm swap transaction in your wallet',
      text: 'Swap',
      statusIcon: 'pending',
    },
    done: {
      title: 'Swap is executed',
      text: 'Swapped',
      statusIcon: 'success',
    },
  },
  bridge: {
    notStarted: {
      title: 'Bridging',
      text: 'Bridge',
      statusIcon: 'none',
    },
    now: {
      title: 'Confirm bridging transaction in your wallet',
      text: 'Bridge',
      statusIcon: 'waiting',
    },
    pending: {
      title: 'Confirm bridging transaction in your wallet',
      text: 'Bridge',
      statusIcon: 'pending',
    },
    done: {
      title: 'Bridging is initiated',
      text: 'Bridge',
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
