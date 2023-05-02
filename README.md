
# Tickets Hub

This simple version of ticketing platfrom that people could buy and sell tickets related to different events.
fault tolerant and decopuled as no dependecny between services. 



## Features

- Users create account and create and update tickets
- Users could buy and sell tickets 
- Users could see past orders and state of every order
- Users use credit cards to pay for tickets

## System Brief Description:

### This is a simple microservices app has 5 services :
- Auth: responsible for creating accounts and checking if user logged in and checking if user has account or not
- Tickets: responsible for creating , deleting , updating , show tickets to Users
- orders: responsible for creating and cancelling orders related to tickets 
- expiration : responsible for cancelling orders if no payment submitted for specific order in 10 minutes
- payments: responsible for handling payment for orders that already valid for payments




## Tech Stack

**Client:** React, NextJs, Bootstrap.

**Server:** Node, Express, Typescript.

**Infrastructure:** Docker, Kubernetes, Skaffold, Nginx.

**Event Streaming/Messaging:** NATs.

**Testing:** Jest, Github Actions.


## Environment Variables

To run this project, you will need to add the following environment variables to your K8s files or add them as secrets to k8s Pods by apply :

```bash
kubectl create secret generic my-secret --from-literal=my-key=my-value
```

`JWT_Key`

`STRIPE_KEY`



## Installation

- to start the project easily: use skaffold and you want to add to host file :

```bash
ticketing.dev:127.0.0.1
```
- start skaffold in root directory: skaffold dev

```bash
  skaffold dev
```
    
## Running Tests

To run tests :
* You should reach directory of each service , then run:

```bash
  npm run test
```


## License

[MIT](https://choosealicense.com/licenses/mit/)

