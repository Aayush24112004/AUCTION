// utils/auctionState.js

const auctions = new Map();

module.exports = {

  // 🔥 Set or update current player
  setCurrentPlayer(hostId, player) {

    if (!auctions.has(hostId)) {
      auctions.set(hostId, {
        currentPlayer: null,
        highestBid: 0,
        highestBidder: null,
        shownPlayers: new Set(),
        auctionLive: true
      });
    }

    const auction = auctions.get(hostId);

    auction.currentPlayer = player;
    auction.highestBid = 0;
    auction.highestBidder = null;
    auction.shownPlayers.add(player._id.toString());
    auction.auctionLive = true;
  },

  getAuction(hostId) {
    return auctions.get(hostId) || {
      currentPlayer: null,
      highestBid: 0,
      highestBidder: null,
      shownPlayers: new Set(),
      auctionLive: false
    };
  },

  updateBid(hostId, amount, teamName) {
    const auction = auctions.get(hostId);
    if (!auction) return;

    auction.highestBid = amount;
    auction.highestBidder = teamName;
  },

  getShownPlayers(hostId) {
    const auction = auctions.get(hostId);
    return auction ? auction.shownPlayers : new Set();
  },

  addShownPlayer(hostId, playerId) {
    const auction = auctions.get(hostId);
    if (auction) {
      auction.shownPlayers.add(playerId.toString());
    }
  },

  // 🔥 CLEAR ONLY CURRENT PLAYER (NOT WHOLE AUCTION)
  clearCurrentPlayer(hostId) {
    const auction = auctions.get(hostId);
    if (auction) {
      auction.currentPlayer = null;
    }
  },

  // 🔥 End auction manually
  endAuction(hostId) {
    auctions.delete(hostId);
  }
};