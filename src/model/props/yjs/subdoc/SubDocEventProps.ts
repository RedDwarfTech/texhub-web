import * as Y from "rdyjs";

export interface SubDocEventProps {
  added: Set<Y.Doc>;
  removed: Set<Y.Doc>;
  loaded: Set<Y.Doc>;
}
