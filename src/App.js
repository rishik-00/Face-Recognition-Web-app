import React, {Component} from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import './App.css';



const ParticlesOptions = {
          particles: {
					            			number : {
					            				value: 150,
					            				density: {
					            					enable: true,
					            					value_area: 800
					            						}
					            					}            			
            		}, 
        "interactivity":
						        {"detect_on":"canvas",
						        "events":
						        		{"onhover":{"enable":true,"mode":"repulse"},
						        "onclick":
						        		{"enable":true,"mode":"push"},"resize":true},
						        "modes":
						        		{"grab":{"distance":400,"line_linked":{"opacity":1}},
						        "bubble":{"distance":400,"size":40,"duration":2,"opacity":8,"speed":3},
						        "repulse":{"distance":200,"duration":0.4},"push":{"particles_nb":4},
						        "remove":{"particles_nb":2}}}
				}
const initialState = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
    }
}

class  App extends Component {
  constructor(){
  	super();
  	this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
  	const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box
  	const image = document.getElementById('input_image');
  	const width = Number(image.width);
  	const height = Number(image.height);
  	return {
  		leftCol: clarifaiFace.left_col*width,
  		topRow: clarifaiFace.top_row*height,
  		rightCol: width - (clarifaiFace.right_col*width),
  		bottomRow: height- (clarifaiFace.bottom_row*height)
  	}
  }

  displayFaceBox = (box) => {
  	this.setState({box})
  }

  onInputChange= (event) => {
  	this.setState({input: event.target.value})
  }

  onPictureSubmit = () => {
  	this.setState({imageUrl: this.state.input});
  	fetch('https://immense-beach-80577.herokuapp.com/imageurl', {
            method: 'post',
            headers: {'Content-Type':'application/json' },
            body: JSON.stringify({
            input: this.state.input
            })
       })
      .then(response => response.json())
	  	.then(response => {
        if(response) {
          fetch('https://immense-beach-80577.herokuapp.com:3000/image', {
            method: 'put',
            headers: {'Content-Type':'application/json' },
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, {entries: count}))
            })
            .catch(console.log)
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
    	.catch(err => console.log(err));
   
  }

  onRouteChange = (route) => {
  	if(route === 'signout') {
  		this.setState(initialState)
  	}else if(route === 'home') {
  		this.setState({isSignedIn: true})
  	}
  	this.setState({route: route})
  }

  render() {
  const  {isSignedIn, imageUrl, box, route} = this.state;
  return (
    <div className="App">
    	<Particles className='particles'
              params={ParticlesOptions}
            />
      <Navigation isSignedIn= {isSignedIn}  onRouteChange = {this.onRouteChange} />
      { route === 'home' 
          ? <div>
	      	  <Logo />
		      <Rank name = {this.state.user.name} entries = {this.state.user.entries} />
		      <ImageLinkForm onInputChange={this.onInputChange} onPictureSubmit= {this.onPictureSubmit} />
			  <FaceRecognition box={box} imageUrl={imageUrl} /> 
	  		</div>
	  	   : (
	  	        route==='signin' 
	  	   		?  <Signin loadUser = {this.loadUser} onRouteChange={this.onRouteChange} />
	  	   		:  <Register loadUser ={this.loadUser} onRouteChange={this.onRouteChange} />
	  	   	)


	  } 
    </div>
  );
  }
}

export default App;
