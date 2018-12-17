Basically using the messaging framework support to communicate between service and API. To start both API and service type
following command:

```
node start.js
```
Browsing http://localhost:3000 should give a graphql API, that executes commands and queries in Service passing data through the MessageBus infrastructure.
