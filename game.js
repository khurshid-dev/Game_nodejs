class Table {
  constructor(args) {
    this.args = args;
    this.createTable();
  }

  createTable() {
    const table = [...Array(this.args.length + 1)].map((_) => Array(this.args.length + 1).fill(""));
    table[0][0] = " ";
    for (let i = 0; i < this.args.length; i++) {
      table[0][i + 1] = this.args[i];
      table[i + 1][0] = this.args[i];
    }
    for (let i = 1; i <= this.args.length; i++) {
      for (let j = 1; j <= this.args.length; j++) {
        if (i === j) {
          table[i][j] = "Draw";
        } else if ((j - i + this.args.length) % this.args.length <= (this.args.length - 1) / 2) {
          table[i][j] = "Win";
        } else {
          table[i][j] = "Lose";
        }
      }
    }
    this.table = table;
  }

  getTable() {
    return this.table;
  }
}

class CheckArgs {
  constructor(args) {
    if (args.length < 3 || args.length % 2 === 0) {
      console.log("Incorrect number of arguments. Please provide odd number greater or equal to 3.");
      console.log("Example: node game.js rock paper scissors lizard Spock");
      process.exit(1);
    }
    const set = new Set(args);
    if (set.size !== args.length) {
      console.log("Duplicate entries are not allowed. Please provide unique arguments.");
      process.exit(1);
    }
  }
}

class RandomBytes {
  constructor() {
    const crypto = require("crypto");
    this.key = crypto.randomBytes(32).toString("hex");
  }
}

class Game {
  constructor(args, key, table) {
    this.args = args;
    this.key = key;
    this.table = table;
  }

  play() {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const computerMoveIndex = Math.floor(Math.random() * this.args.length);
    const computerMove = this.args[computerMoveIndex];
    const crypto = require("crypto");
    const hmacDigest = crypto.createHmac("sha256", this.key).update(computerMove).digest("hex");
    console.log(`HMAC: ${hmacDigest}`);
    const choices = this.args.map((choice, index) => `${index + 1} - ${choice}`).join("\n");
    console.log(`Available moves:\n${choices}\n0 - Exit\n? - Help`);
    readline.question("Enter your move: ", (input) => {
      if (input === "?") {
        console.table(this.table);
        readline.close();
        this.play();
        return;
      }
      if (!input.match(/^\d+$/)) {
        console.log("Invalid input. Please enter a valid number or ? for help.");
        readline.close();
        this.play();
        return;
      }
      const choiceIndex = parseInt(input) - 1;
      if (choiceIndex === -1) {
        readline.close();
        console.log("The game ends!");
        return;
      }
      const userMove = this.args[choiceIndex];
      if (!Number.isInteger(choiceIndex) || choiceIndex < 0 || choiceIndex >= this.args.length) {
        console.log("Invalid input. Please enter a valid number or ? for help.");
        readline.close();
        this.play();
        return;
      }
      const computerMoveIndex = Math.floor(Math.random() * this.args.length);
      const result = this.table[choiceIndex + 1][computerMoveIndex + 1];
      console.log(`Your move: ${userMove}`);
      console.log(`Computer move: ${computerMove}`);
      console.log(`Result: ${result}`);
      console.log(`HMAC key: ${this.key}`);
      readline.close();
    });
  }
}

function runApp() {
  const args = process.argv.slice(2);
  new CheckArgs(args);
  const key = new RandomBytes().key;
  const table = new Table(args).getTable();
  new Game(args, key, table).play();
}

runApp();
