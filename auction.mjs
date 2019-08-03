
export function Auction() {
  this.bids = new Map();
}

Auction.prototype.includes = function(player) {
  return this.bids.has(player);
};

Auction.prototype.bid = function(contract) {
  let player = contract.owner;
  this.bids.set(player, contract);
};

Auction.prototype.concede = function(player) {
  this.bids.delete(player);
};

Auction.prototype.bidders = function() {
  let next = () => this.bids.keys();
  return { [Symbol.iterator]: next };
};

Auction.prototype.blind = function() {
  return this.bids.size;
};

Auction.prototype.settled = function() {
  return this.bids.size <= 1;
};

Auction.prototype.winner = function() {
  let winner, highest = 0;

  let iterator = this.bids.values();
  for (let contract of iterator) {
    if (contract.value > highest) {
      winner = contract;
      highest = contract.value;
    }
  }

  return winner;
};

