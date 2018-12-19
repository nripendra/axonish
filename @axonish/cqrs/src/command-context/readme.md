# CommandContext

Is going to be a property of command. This property should be set by command executor. Inside the command handler (aggregate
root) it gives utility functions such as setState, getState, apply etc. In future we can use this class to pass on other
context metadata.
