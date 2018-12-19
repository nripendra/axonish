#Command Executor
Is what has traditionally been called a command handler. It listens on the command-bus for a
command, creates an instance of aggregate-root and call appropriate method on that instance.
In case of axonish the method is called a command-handler. So, basically the command executor
depends on repository, and has an "execute" method that does all the necessary things.

The execute method should do following thing in order:
1. Using the repository instance passed through the constructor, get an instance of aggregate-root,
and if repository returns a null, create new instance of the aggregate-root using "Container".
2. Create CommandContext instance, and supply the aggregate-root instance in it's constructor.
3. Assign the CommandContext instance to the "ctx" property of command instance.
4. Call the command-handler function on the aggregate-root instance.
5. Save the uncomitted events to repository.
6. Call "commit" method on aggregate-root instance.
