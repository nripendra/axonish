@HandlesEvent decorator.

Takes in name of event it can handle, and applies to a method. This method basically works by modifiying the prototype of the
class where this decorator is applied. The upper level decorator like @AggeregateRoot, @Projection or @Reactor etc., should
get those data from prototype, add these data to metadata dictionaries and then undo the changes made by @HandlesEvent, on
the prototype.

Basically, this decorator is not meant to work alone, but in conjunction with a class decorator.

For example:

```ts
@AggregateRoot()
class MyAggregateRoot {
  @HandlesEvent(MyEvent())
  onMyEvent(event: MyEvent) {
    // handle event here...
  }
}
```
