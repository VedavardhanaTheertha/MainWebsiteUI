export const railInteractionStart = "rail-interaction-start";
export const railInteractionEnd = "rail-interaction-end";

export function enableHorizontalMouseScroll(root: Document) {
  let gesture: {
    rail: HTMLElement;
    pointerId: number;
    x: number;
    y: number;
    left: number;
    dragging: boolean;
  } | null = null;
  let suppressClick: HTMLElement | null = null;

  function scrollable(target: EventTarget | null) {
    let element = target instanceof Element ? target : null;
    while (element && element !== root.documentElement) {
      if (element instanceof HTMLElement &&
          element.scrollWidth > element.clientWidth + 1 &&
          /^(auto|scroll)$/.test(getComputedStyle(element).overflowX)) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  }

  function mark(rail: HTMLElement) {
    rail.dataset.mouseScroll = "ready";
  }

  function finish() {
    if (!gesture) return;
    const { rail, dragging } = gesture;
    if (dragging) {
      rail.dataset.mouseScroll = "ready";
      suppressClick = rail;
    }
    rail.dispatchEvent(new Event(railInteractionEnd));
    gesture = null;
  }

  function over(event: PointerEvent) {
    if (event.pointerType !== "mouse" || gesture) return;
    const rail = scrollable(event.target);
    if (rail) mark(rail);
  }

  function down(event: PointerEvent) {
    finish();
    suppressClick = null;
    if (event.pointerType !== "mouse" || event.button !== 0 ||
        event.ctrlKey || event.metaKey || event.altKey || event.shiftKey ||
        (event.target instanceof Element &&
          event.target.closest("input, textarea, select, [contenteditable]:not([contenteditable='false']), [role='slider']"))) return;
    const rail = scrollable(event.target);
    if (!rail) return;
    mark(rail);
    gesture = { rail, pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: rail.scrollLeft, dragging: false };
  }

  function move(event: PointerEvent) {
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    if (event.buttons === 0) { finish(); return; }
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.dragging) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
      if (Math.abs(dy) > Math.abs(dx)) { finish(); return; }
      gesture.dragging = true;
      gesture.rail.dataset.mouseScroll = "dragging";
      gesture.rail.dispatchEvent(new Event(railInteractionStart));
      root.getSelection()?.removeAllRanges();
    }
    event.preventDefault();
    gesture.rail.scrollLeft = gesture.left - dx;
  }

  function up(event: PointerEvent) {
    if (gesture?.pointerId === event.pointerId) finish();
  }

  function click(event: MouseEvent) {
    if (event.detail === 0 || !suppressClick || !(event.target instanceof Node) ||
        !suppressClick.contains(event.target)) return;
    suppressClick = null;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function drag(event: DragEvent) {
    if (gesture) event.preventDefault();
  }

  root.addEventListener("pointerover", over);
  root.addEventListener("pointerdown", down, true);
  root.addEventListener("pointermove", move, { passive: false });
  root.addEventListener("pointerup", up);
  root.addEventListener("pointercancel", up);
  root.addEventListener("click", click, true);
  root.addEventListener("dragstart", drag);
  root.defaultView?.addEventListener("blur", finish);

  return () => {
    finish();
    root.removeEventListener("pointerover", over);
    root.removeEventListener("pointerdown", down, true);
    root.removeEventListener("pointermove", move);
    root.removeEventListener("pointerup", up);
    root.removeEventListener("pointercancel", up);
    root.removeEventListener("click", click, true);
    root.removeEventListener("dragstart", drag);
    root.defaultView?.removeEventListener("blur", finish);
    for (const rail of root.querySelectorAll<HTMLElement>("[data-mouse-scroll]")) delete rail.dataset.mouseScroll;
  };
}
