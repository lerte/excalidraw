import type { ElementsMap, ExcalidrawElement } from "../../element/types";
import { getStepSizedValue, isPropertyEditable } from "./utils";

import DragInput from "./DragInput";
import type { DragInputCallbackType } from "./DragInput";
import { ROUNDNESS } from "../../constants";
import { getBoundTextElement } from "../../element/textElement";
import { isArrowElement } from "../../element/typeChecks";
import { mutateElement } from "../../element/mutateElement";

interface RoundProps {
  element: ExcalidrawElement;
  elementsMap: ElementsMap;
}

const STEP_SIZE = 10;

const Round = ({ element, elementsMap }: RoundProps) => {
  const handleRoundChange: DragInputCallbackType = ({
    accumulatedChange,
    originalElements,
    shouldChangeByStepSize,
    nextValue,
  }) => {
    const origElement = originalElements[0];
    if (origElement) {
      if (nextValue !== undefined) {
        mutateElement(element, {
          roundness: {
            type: ROUNDNESS.ADAPTIVE_RADIUS,
            value: nextValue,
          },
        });

        const boundTextElement = getBoundTextElement(element, elementsMap);
        if (boundTextElement && !isArrowElement(element)) {
          mutateElement(boundTextElement, {
            roundness: {
              type: ROUNDNESS.ADAPTIVE_RADIUS,
              value: nextValue,
            },
          });
        }

        return;
      }

      const originalRoundValue = origElement.roundness?.value ?? 0;
      const changeRoundValue = accumulatedChange;
      let nextRoundValue = originalRoundValue + changeRoundValue;
      if (shouldChangeByStepSize) {
        nextRoundValue = getStepSizedValue(nextRoundValue, STEP_SIZE);
      }

      mutateElement(element, {
        roundness: {
          type: ROUNDNESS.ADAPTIVE_RADIUS,
          value: Math.max(0, nextRoundValue),
        },
      });

      const boundTextElement = getBoundTextElement(element, elementsMap);
      if (boundTextElement && !isArrowElement(element)) {
        mutateElement(boundTextElement, {
          roundness: {
            type: ROUNDNESS.ADAPTIVE_RADIUS,
            value: Math.max(0, nextRoundValue),
          },
        });
      }
    }
  };

  return (
    <DragInput
      label="R"
      elements={[element]}
      dragInputCallback={handleRoundChange}
      editable={isPropertyEditable(element, "roundness")}
      value={element.roundness?.value ?? (element.roundness?.type ? 32 : 0)}
    />
  );
};

export default Round;
