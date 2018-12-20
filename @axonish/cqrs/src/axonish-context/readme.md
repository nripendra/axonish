# AxonishContext

Is going to be a property of Command, and DomainEvent classes. This property should be set by command executor, or the event
dispatcher. Inside the command handler (aggregateroot) it gives utility functions such as setState, getState, apply etc. In
future we can use this class to pass on other context metadata.
