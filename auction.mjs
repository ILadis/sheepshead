
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
  return this.bids.keys();
};

Auction.prototype.lead = function() {
  let lead, highest = 0;
  for (let contract of this.bids.values()) {
    if (contract.value > highest) {
      lead = contract;
      highest = contract.value;
    }
  }

  return lead;
};

Auction.prototype.blind = function() {
  return this.bids.size;
};

Auction.prototype.settled = function() {
  return this.bids.size <= 1;
};

