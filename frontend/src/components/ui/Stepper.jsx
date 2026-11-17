import React from 'react';
import classNames from '../../utils/classnames';
import { LuCheck } from 'react-icons/lu';

export default function Stepper({ steps = [], current = 0 }) {
  return (
    <div
      className="stepper"
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={steps.length}
    >
      {steps.map((label, i) => {
        const isDone = i < current;
        const isActive = i === current;

        return (
          <div
            key={label}
            className={classNames('stepper-step', {
              active: isActive,
              done: isDone,
            })}
          >
            <div className="stepper-dot">
              {isDone ? (
                <LuCheck size={16} strokeWidth={2.2} />
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <span className="stepper-label">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
