
export function Auction() {
  this.bids = new Map();
}

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
  for (let [player, contract] of this.bids) {
    if (contract && contract.value > highest) {
      lead = contract;
      highest = contract.value;
    }
  }

  return lead;
};

Auction.prototype.settled = function() {
  return this.bids.size <= 1;
};

