class QLearning {
    constructor(actions, alpha = 0.1, gamma = 0.9, epsilon = 0.1) {
        this.actions = actions; // Possible actions
        this.alpha = alpha;     // Learning rate
        this.gamma = gamma;     // Discount factor
        this.epsilon = epsilon; // Exploration rate
        this.qTable = {};       // Q-table
    }

    // Initialize Q-table with zeros
    initializeQTable(gridWidth, gridHeight) {
        for (let i = 0; i < gridHeight; i++) {
            for (let j = 0; j < gridWidth; j++) {
                const state = `${i},${j}`;
                this.qTable[state] = {};
                this.actions.forEach(action => {
                    this.qTable[state][action] = 0;
                });
            }
        }
    }

    // Choose action based on epsilon-greedy policy
    chooseAction(state) {
        if (Math.random() < this.epsilon) {
            return this.actions[Math.floor(Math.random() * this.actions.length)]; // Explore
        }
        return Object.keys(this.qTable[state]).reduce((a, b) => this.qTable[state][a] > this.qTable[state][b] ? a : b); // Exploit
    }

    // Update Q-value
    updateQValue(state, action, reward, nextState) {
        const maxNextQ = Math.max(...Object.values(this.qTable[nextState]));
        this.qTable[state][action] += this.alpha * (reward + this.gamma * maxNextQ - this.qTable[state][action]);
    }

    // Get Q-value for a specific state-action pair
    getQValue(state, action) {
        return this.qTable[state][action];
    }
}
