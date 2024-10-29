import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { ERROR } from "../features/errorSlice";

export const useAsyncHandler = (callback, options = {}) => {
  const { onSuccess, isLoading, error } = options;
  const dispatch = useDispatch();

  const [state, setState] = useState({
    isLoading: false,
    error: null,
  });

  const handler = useCallback(
    async (...args) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await callback(...args);
        setState((prev) => ({ ...prev, isLoading: false }));

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error,
        }));

        dispatch(
          ERROR({
            message: "Something went wrong!",
            type: "danger",
            timeline: true,
            status: true,
          })
        );
      }
    },
    [callback, onSuccess, isLoading, error]
  );

  return [handler, state];
};
