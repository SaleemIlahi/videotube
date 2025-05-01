import { useState } from "react";

const useMultiStepForm = (renderSteps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const next = () => {
    setCurrentStep((i) => {
      if (i >= renderSteps.length - 1) return i;
      return i + 1;
    });
  };
  const back = () => {
    setCurrentStep((i) => {
      if (i <= 0) return i;
      return i - 1;
    });
  };

  return {
    RenderStep: renderSteps[currentStep],
    currentIndex: currentStep,
    totalStep: renderSteps.length,
    currentStep: currentStep + 1,
    next,
    back,
    isLastStep: currentStep === renderSteps.length - 1,
    isFirstStep: currentStep === 0,
  };
};

export default useMultiStepForm;
