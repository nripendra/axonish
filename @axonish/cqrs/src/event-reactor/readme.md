# @EventReactor

This decorator should be used to annotate the class that is responsible for listening to events and reacting to them. Not
really that different from a projection handler. However, one critical difference from projection handler is the fact that
event reactors are supposed to be working in background, while main request flow can continue without waiting for it to
complete. Infact, most of proponents of CQRS do implement projection as a reactor and prefer eventual consistency. Meanwhile
Axonish will support both the flow. A developer can choose to implement projections in event-reactor or a projection handler,
as per their preference.

## Usage

```ts
@EventReactor()
export class MyEventReactor {
  @HandlesEvent(MyEvent1())
  onMyEvent1(event: MyEvent1) {
    const { getState } = event.ctx!;
  }
}
```
