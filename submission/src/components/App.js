import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
import MemoryToken from '../abis/MemoryToken.json'
import pikachu from '../pikachu.png'


const CARD_ARRAY = [
  {
    name: 'pikachu',
    img: '/images/pikachu1.png'
  },
  {
    name: 'articuno',
    img: '/images/articuno.png'
  },
  {
    name: 'charizard',
    img: '/images/charizard.png'
  },
  {
    name: 'dragonknight',
    img: '/images/dragonknight.png'
  },
  {
    name: 'zapdos',
    img: '/images/zapdos.png'
  },
  {
    name: 'myuth',
    img: '/images/myuth.png'
  },
  {
    name: 'pikachu',
    img: '/images/pikachu1.png'
  },
  {
    name: 'articuno',
    img: '/images/articuno.png'
  },
  {
    name: 'charizard',
    img: '/images/charizard.png'
  },
  {
    name: 'dragonknight',
    img: '/images/dragonknight.png'
  },
  {
    name: 'zapdos',
    img: '/images/zapdos.png'
  },
  {
    name: 'myuth',
    img: '/images/myuth.png'
  },
]




class App extends Component {



  async componentDidMount() {
    await this.loadWeb3()
    await this.loadBlockChainData()
    this.setState({ cardArray: CARD_ARRAY.sort(() => 0.5 - Math.random()) })

  }




  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }


  async loadBlockChainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })


    const networkId = await web3.eth.net.getId()
    const networkData = MemoryToken.networks[networkId]
    if (networkData) {
      const abi = MemoryToken.abi
      const address = networkData.address
      const token = new web3.eth.Contract(abi, address)
      this.setState({ token })
      const totalSupply = await token.methods.totalSupply().call()
      this.setState({ totalSupply })
      // Load Tokens
      let balanceOf = await token.methods.balanceOf(accounts[0]).call()
      for (let i = 0; i < balanceOf; i++) {
        let id = await token.methods.tokenOfOwnerByIndex(accounts[0], i).call()
        let tokenURI = await token.methods.tokenURI(id).call()
        this.setState({
          tokenURIs: [...this.state.tokenURIs, tokenURI]
        })
      }
    }
    else {
      alert("Smart contract not deployed to detected network.")
    }
    console.log(networkId)

  }



  chooseImage = (cardId) => {
    cardId = cardId.toString()
    if (this.state.cardsWon.includes(cardId)) {
      return window.location.origin + '/images/empty.png'
    }
    if (this.state.cardsChosenId.includes(cardId)) {
      return CARD_ARRAY[cardId].img
    } else {
      return window.location.origin + '/images/pokeball.png'
    }
  }



  flipCard = async (cardId) => {
    let alreadyChosen = this.state.cardsChosen.length

    this.setState({
      cardsChosen: [...this.state.cardsChosen, this.state.cardArray[cardId].name],
      cardsChosenId: [...this.state.cardsChosenId, cardId]
    })

    if (alreadyChosen === 1) {
      setTimeout(this.checkForMatch, 100)
    }
  }



  checkForMatch = async () => {
    const optionOneId = this.state.cardsChosenId[0]
    const optionTwoId = this.state.cardsChosenId[1]

    if (optionOneId == optionTwoId) {
      alert('You have clicked the same image!')
    } else if (this.state.cardsChosen[0] === this.state.cardsChosen[1]) {
      alert('You found a match')
      this.state.token.methods.mint(
        this.state.account,
        window.location.origin + CARD_ARRAY[optionOneId].img.toString()
      )
        .send({ from: this.state.account })
        .on('transactionHash', (hash) => {
          this.setState({
            cardsWon: [...this.state.cardsWon, optionOneId, optionTwoId],
            tokenURIs: [...this.state.tokenURIs, CARD_ARRAY[optionOneId].img]
          })
        })
    } else {
      alert('Sorry, try again')
    }
    this.setState({
      cardsChosen: [],
      cardsChosenId: []
    })
    if (this.state.cardsWon.length === CARD_ARRAY.length) {
      alert('Congratulations! You found them all!')
    }
  }



  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      token: null,
      totalSupply: 0,
      tokenURIs: [],
      cardArray: [],
      cardsChosen: [],
      cardsChosenId: [],
      cardsWon: []
    }
  }

  render() {
    return (
      <div>
        <nav className="custom-style navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="custom-nav-logo navbar-brand  mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img style={{borderRadius: "10px"}}  src={pikachu} width="50" height="50" className="d-inline-block " alt="" />
            &nbsp; Catch'em-All
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-muted"><span id="account">{this.state.account}</span></small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid">
          <main className="main-container ">


            <div className="card-container">
              <h1 className="d-4">Gotta catch'em all!</h1>
              <div className="card-grid grid mb-4" >
                {this.state.cardArray.map((card, key) => {
                  return (
                    <img
                      key={key}
                      src={this.chooseImage(key)}
                      data-id={key}
                      onClick={(event) => {
                        let cardId = event.target.getAttribute('data-id')
                        if (!this.state.cardsWon.includes(cardId.toString())) {
                          this.flipCard(cardId)
                        }
                      }}
                    />
                  )
                })}

              </div>
            </div>



            <div className="tokens-container">
              <h5>Tokens Collected:<span id="result">&nbsp;{this.state.tokenURIs.length}</span></h5>
              <div className="grid mb-4" >
                {this.state.tokenURIs.map((tokenURI, key) => {
                  return (
                    <img
                      key={key}
                      src={tokenURI}
                    />
                  )
                })}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}

export default App;
