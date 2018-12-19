# @AggregateRoot decorator

Should be applied to a class that will serve as the aggregate root. The aggregate root will handle the related commands and
process resulting events, and maintain the state.

Things like repository, instantiating aggregate-root etc will be taken care by the framework.

## Comitting

Comitting events will execute projections, then publish the events for external event reactors to consume and then reset the
uncomitted events property. Applying all the projections related to an event must be part of commit, i.e. commit should wait
for the projections to finish, but other reactors can be executed in background, while commit method can return.

## Pipeline

There should be a concept of pipeline. A pipeline is lifecycle stage of handling a single command, it is not a "Process
Manager". For process manager we can simply do it in reactors, just by introducing a dependency injection of certain services
that can help in perisisting state of process-manager. We'll think in future if special process-manager entity is required.

## Snap shots

There should be some way to handle snap-shots, I would like it to be as automatic as possible with sane defaults e.g. apply
snap-shot after every 50 events etc., but with possibility for user to override things.
