# Waellet Oracle Service

This repo is hosting the oracle service used in waellet browser.

Oracles are needed in waellet for the tipping functionality it offers its users.

### How the tipping works
It works in a decentralized way via smart contracts and allows visitors to tip your website with only few simple clicks in the waellet extension.

# Oracles

Oracles are used to verify the ownership of a certain domain name. The smart contracts generate a TXT record that one will need to add to the claimed domain's DNS records in order for them to proove its ownership.

## Tipping

Meanwhile the tipping functionality works out of the box and one can tip a website even if it is not yet confirmed by its owner.

The smart contract will act as a jar and store the tips until the rightful owner claims the possesion of the domain.


### Config

Create a `config/config.js` containing the secrets for the orale
```javascript
module.exports = {
    keypair: {
        secretKey: "<SECRET_KEY>",
        publicKey: "<PUBLIC_KEY>"
    },
    client: {
        secretKey: "<SECRET_KEY>",
        publicKey: "<PUBLIC_KEY>"
    }
}
```
