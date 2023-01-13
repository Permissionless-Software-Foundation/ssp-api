/*
  Claim Entity

  Claims are on-chain statements about a Token or another Claim.
*/

class ClaimEntity {
  validate (inObj = {}) {
    const { txid, about, content } = inObj

    // Input Validation
    if (!txid || typeof txid !== 'string') {
      throw new Error("Property 'txid' must be a string!")
    }
    if (!about || typeof about !== 'string') {
      throw new Error("Property 'about' must be a string!")
    }
    if (!content || typeof content !== 'string') {
      throw new Error("Property 'content' must be a string!")
    }

    return inObj
  }
}

export default ClaimEntity
