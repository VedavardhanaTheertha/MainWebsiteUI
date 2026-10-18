"use client";

import { useEffect } from "react";
import { enableHorizontalMouseScroll } from "@/lib/horizontal-scroll";

export default function HorizontalScrollSupport() {
  useEffect(() => enableHorizontalMouseScroll(document), []);
  return null;
}
