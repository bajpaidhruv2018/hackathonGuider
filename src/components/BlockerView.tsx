"use client";

import { Blocker } from "@/lib/types";

interface BlockerViewProps {
  blockers: Blocker[];
}

const severityConfig: Record<
  string,
  { label: string; className: string; icon: string }
> = {
  critical: { label: "Critical", className: "severity-critical", icon: "🔴" },
  medium: { label: "Medium", className: "severity-medium", icon: "🟡" },
  low: { label: "Low", className: "severity-low", icon: "🟢" },
};

export default function BlockerView({ blockers }: BlockerViewProps) {
  if (!blockers || blockers.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">✅</div>
        <p>No blockers reported. Report status updates in the chat anytime.</p>
      </div>
    );
  }

  const active = blockers.filter((b) => !b.resolved);
  const resolved = blockers.filter((b) => b.resolved);

  return (
    <div className="blocker-view">
      {/* Active Blockers */}
      {active.length > 0 && (
        <div className="blocker-section">
          <div className="blocker-section-header">
            <span className="blocker-section-title">
              Active ({active.length})
            </span>
          </div>
          <div className="blocker-list">
            {active.map((blocker) => {
              const sev = severityConfig[blocker.severity] || severityConfig.low;
              return (
                <div key={blocker.id} className="blocker-card active">
                  <div className="blocker-card-header">
                    <span className={`blocker-severity ${sev.className}`}>
                      {sev.icon} {sev.label}
                    </span>
                    <span className="blocker-time">
                      {new Date(blocker.reported_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="blocker-description">{blocker.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resolved Blockers */}
      {resolved.length > 0 && (
        <div className="blocker-section resolved-section">
          <details>
            <summary className="blocker-section-header resolved">
              <span className="blocker-section-title">
                Resolved ({resolved.length})
              </span>
            </summary>
            <div className="blocker-list">
              {resolved.map((blocker) => (
                <div key={blocker.id} className="blocker-card resolved">
                  <div className="blocker-card-header">
                    <span className="blocker-resolved-badge">✓ Resolved</span>
                  </div>
                  <p className="blocker-description">{blocker.description}</p>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
