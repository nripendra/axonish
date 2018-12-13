# Axonish

Axonish is a nodejs microservice framework implemented in typescript. The goal is to implement developer friendly Cqrs and eventsourcing
framework, with graphql api front-end. The name "axonish" is derived from [axon](https://axoniq.io/) framework. Although, it is not a nodejs
port for [axon](https://axoniq.io/), the initial inspiration came after going through the axon docs.

Axonish itself is an amalgamation of lots of libraries and their dependencies, to name major ones:

- [type-graphql](https://github.com/19majkel94/type-graphql)
- [apollo-server](https://github.com/apollographql/apollo-server)
- [cote](https://github.com/dashersw/cote)
- [graphql-js](https://github.com/graphql/graphql-js)
- [graphql-yoga](https://github.com/prisma/graphql-yoga)

Basic idea is to use [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) to define all major aspects of your application,
which in many ways is similar to [nestjs](https://nestjs.com/), but one of my major goal is to reduce a lot of configuration boiler-plates.
However, a lot of other boiler-plates may get introduced 😃

More than a framework, Axonish will strive to be an **opinionated** programming model, and project architecture. Please note the word **opinionated**,
it means there will be right ways to do things, which you may or maynot agree with.

## Getting started

This is still very much a **work in progress**, so there isn't any way to get started with yet 😛. However, if you want to contribute (with a PR),
then please visit contributor's section below.

## Contributors

You'll need to install following:

- [vscode](https://code.visualstudio.com/download)
- [nodejs](https://nodejs.org/en/download/current/) and npm.
- [yarn](https://yarnpkg.com/lang/en/docs/install/)
- [git](https://git-scm.com/downloads)
- [prettier-vscode](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

Now install [typescript](https://www.typescriptlang.org/)

```
npm install -g typescript
```

Now, clone the monorepo from https://github.com/nripendra/axonish

```
git clone https://github.com/nripendra/axonish.git
```

Now, run the yarn commands as follows:

```
yarn
```

```
yarn build
```

Execute tests with following command:

```
yarn test
```
