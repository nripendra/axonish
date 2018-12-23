export function topMostModule(
  nodeModule: NodeModule | undefined
): NodeModule | undefined {
  if (!nodeModule) {
    return nodeModule;
  }
  while (nodeModule.parent != null) {
    nodeModule = nodeModule.parent;
  }
  return nodeModule;
}
