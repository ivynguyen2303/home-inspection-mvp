import React, { useMemo } from 'react';
import { useLocalStore } from '@/store/localStore';

interface Props {
  requestId: string;
  /** optional: lets you pass the current count so parent re-renders don’t hide changes */
  interestCount?: number;
}

export function InterestButton({ requestId }: Props) {
  const { inspectorProfile, requests, toggleInterest } = useLocalStore();

  const { isInterested, count, disabled } = useMemo(() => {
    const r = requests.find(x => x.id === requestId);
    if (!r) return { isInterested: false, count: 0, disabled: true };
    const email = inspectorProfile?.email ?? '';
    const interested = r.interestedInspectorEmails.includes(email);
    return {
      isInterested: interested,
      count: r.interestCount ?? r.interestedInspectorEmails.length,
      disabled: !email
    };
  }, [inspectorProfile?.email, requestId, requests]);

  const onClick = () => {
    if (disabled) return;
    toggleInterest(requestId, inspectorProfile.email);
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-1 border 
                  ${isInterested ? 'bg-rose-100 border-rose-300' : 'bg-white border-gray-300'}`}
      title={disabled ? 'Sign in as an inspector to express interest' : (isInterested ? 'Remove interest' : "I'm interested")}
      data-testid={`interest-button-${requestId}`}
    >
      <span aria-hidden>{isInterested ? '❤️' : '🤍'}</span>
      <span className="text-sm">{isInterested ? 'Interested' : "I'm Interested"}</span>
      <span className="text-xs opacity-70">({count})</span>
    </button>
  );
}
