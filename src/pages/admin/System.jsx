import { useState } from "react";
import { Download, Database, Eye, EyeOff } from "lucide-react";
import {
  PageHead,
  Panel,
  Records,
  SearchBox,
  Select,
  Badge,
  Field,
  Modal,
} from "../../components/common/UI";
import { useApp } from "../../hooks/useApp";
import { downloadCSV, downloadJSON } from "../../utils/format";
import { authService } from "../../services/authService";
export function Access() {
  const rows = [
    {
      id: "FARMER",
      role: "Farmer / general user",
      information: "View public information",
      agriculture: "No management access",
      technical: "Own profile only",
    },
    {
      id: "MAO",
      role: "MAO personnel",
      information: "View and use agricultural tools",
      agriculture: "Crops, markets, prices, validation, history, reports",
      technical: "No system administration",
    },
    {
      id: "ADMIN",
      role: "System administrator",
      information: "Limited to system responsibilities",
      agriculture: "No agricultural management",
      technical: "Accounts, access, audit, security, configuration",
    },
  ];
  return (
    <>
      <PageHead
        title="Roles & access"
        description="The responsibility boundary for each AgriPrice role."
      />
      <Panel>
        <Records
          rows={rows}
          columns={[
            { key: "role", label: "Role" },
            { key: "information", label: "Information access" },
            { key: "agriculture", label: "Agricultural management" },
            { key: "technical", label: "Technical administration" },
          ]}
        />
      </Panel>
      <div className="notice">
        This matrix defines AgriPrice role boundaries. Assign account
        roles from User Accounts or MAO Accounts. Production permissions must
        also be enforced by the backend.
      </div>
    </>
  );
}
export function Audit() {
  const { data } = useApp(),
    [q, setQ] = useState("");
  const rows = data.audit.filter((r) =>
    `${r.actor} ${r.action} ${r.type}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHead
        title="System activity & audit logs"
        description="Recent account and application activity."
        action={
          <button
            className="button"
            disabled={!rows.length}
            onClick={() => downloadCSV("agriprice-audit", rows)}
          >
            <Download size={17} />
            Export CSV
          </button>
        }
      />
      <SearchBox
        value={q}
        onChange={setQ}
        placeholder="Search audit activity"
      />
      <Panel>
        <Records
          rows={rows}
          columns={[
            { key: "actor", label: "Account" },
            { key: "action", label: "Action" },
            { key: "type", label: "Category" },
            { key: "date", label: "Date & time" },
            { key: "status", label: "Result" },
          ]}
        />
      </Panel>
    </>
  );
}
export function Monitoring() {
  const { notify } = useApp(),
    [checked, setChecked] = useState("Available");
  return (
    <>
      <PageHead
        title="System monitoring"
        description="Service status overview."
        action={
          <button
            className="button"
            onClick={() => {
              setChecked(new Date().toLocaleTimeString());
              notify(
                "System status refreshed.",
              );
            }}
          >
            Refresh local status
          </button>
        }
      />
      <Panel>
        {[
          [
            "Frontend application",
            "Available",
            "Application service is available.",
          ],
          [
            "API service",
            "Unavailable",
            "Service status is currently unavailable.",
          ],
          [
            "Database connectivity",
            "Unavailable",
            "Connectivity status is currently unavailable.",
          ],
          [
            "Forecasting service",
            "Available",
            "Forecast information is available.",
          ],
        ].map(([name, status, desc]) => (
          <div className="monitor-row" key={name}>
            <div>
              <h3>{name}</h3>
              <p className="muted mt-2">{desc}</p>
            </div>
            <Badge tone={status === "Available" ? "" : "neutral"}>
              {status}
            </Badge>
          </div>
        ))}
        <p className="fine-print">
          Last status check: {checked}.
        </p>
      </Panel>
    </>
  );
}
export function Security() {
  const { data } = useApp();
  return (
    <>
      <PageHead
        title="Security administration"
        description="Account security information and integration status."
      />
      <div className="two-column">
        <Panel>
          <h2>Account status</h2>
          <dl className="result-lines">
            <div>
              <dt>Active accounts</dt>
              <dd>{data.users.filter((u) => u.status === "Active").length}</dd>
            </div>
            <div>
              <dt>Suspended accounts</dt>
              <dd>
                {data.users.filter((u) => u.status === "Suspended").length}
              </dd>
            </div>
          </dl>
          <p className="muted">
            Use account management to suspend or reactivate accounts.
          </p>
        </Panel>
        <Panel>
          <h2>Production security controls</h2>
          {[
            "Server-enforced role authorization",
            "Password hashing and secure sessions",
            "Rate limiting and security event collection",
          ].map((t) => (
            <div className="status-row" key={t}>
              <span>{t}</span>
              <Badge tone="neutral">Not connected</Badge>
            </div>
          ))}
        </Panel>
      </div>
      <Panel>
        <h2>Recorded security events</h2>
        <Records
          rows={data.audit.filter((r) => r.type === "Security")}
          columns={[
            { key: "action", label: "Event" },
            { key: "date", label: "Date" },
            { key: "status", label: "Result" },
          ]}
        />
      </Panel>
    </>
  );
}
export function Configuration() {
  const { data, commit, notify, session, save } = useApp(),
    [timeout, setTimeoutValue] = useState(data.settings.sessionTimeout),[pass,setPass]=useState({current:"",next:"",confirm:""}),[show,setShow]=useState(false);
  return (
    <>
      <PageHead
        title="Technical configuration"
        description="Configure technical system settings."
      />
      <Panel className="max-form">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (
              commit({
                ...data,
                settings: { ...data.settings, sessionTimeout: Number(timeout) },
              })
            )
              notify(
                "Configuration saved successfully.",
              );
          }}
        >
          <div className="form-stack">
            <Field
              label="Session timeout (minutes)"
              hint="Set the preferred account session duration."
            >
              <input
                required
                type="number"
                min="5"
                max="240"
                value={timeout}
                onChange={(e) => setTimeoutValue(e.target.value)}
              />
            </Field>
            <Field label="Study municipality">
              <input readOnly value="Jala-Jala, Rizal" />
            </Field>
            <Field label="Data source">
              <input readOnly value="Local application records" />
            </Field>
            <button className="button">Save configuration</button>
          </div>
        </form>
      </Panel>
      <Panel className="max-form"><h2>Account Security</h2><form className="form-stack mt-4" onSubmit={e=>{e.preventDefault();if(!authService.verifyCurrentPassword(session,pass.current))return notify("Current password is incorrect.");if(pass.next.length<8)return notify("Use at least 8 characters.");if(pass.next!==pass.confirm)return notify("New passwords do not match.");save("users",{...session,password:pass.next});setPass({current:"",next:"",confirm:""});notify("Password changed successfully.")}}>{[["Current Password","current"],["New Password","next"],["Confirm New Password","confirm"]].map(([label,key])=><Field key={key} label={label}><div className="password-field"><input required minLength="8" type={show?"text":"password"} value={pass[key]} onChange={e=>setPass({...pass,[key]:e.target.value})}/><button type="button" className="icon-button" onClick={()=>setShow(!show)} aria-label="Toggle password visibility">{show?<EyeOff/>:<Eye/>}</button></div></Field>)}<button className="button">Change Password</button></form></Panel>
    </>
  );
}
export function Backups() {
  const { data, commit, notify } = useApp(),
    [restore, setRestore] = useState(null);
  const [snapshot, setSnapshot] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("agriprice.backup.v1"));
    } catch {
      return null;
    }
  });
  function create() {
    const backup = { createdAt: new Date().toISOString(), data };
    try {
      localStorage.setItem("agriprice.backup.v1", JSON.stringify(backup));
      setSnapshot(backup);
      downloadJSON("agriprice-backup", backup);
      notify("Backup file saved and downloaded.");
    } catch {
      notify("Could not save the snapshot. Browser storage may be full.");
    }
  }
  return (
    <>
      <PageHead
        title="Backup & recovery"
        description="Save and restore browser-local Current records."
        action={
          <button className="button" onClick={create}>
            <Database size={17} />
            Create backup file
          </button>
        }
      />
      <Panel>
        <h2>Latest local snapshot</h2>
        {snapshot ? (
          <>
            <p className="muted my-4">
              Created {new Date(snapshot.createdAt).toLocaleString()}
            </p>
            <div className="row-actions">
              <button
                className="button secondary"
                onClick={() => downloadJSON("agriprice-backup", snapshot)}
              >
                <Download size={16} />
                Download JSON
              </button>
              <button
                className="button secondary"
                onClick={() => setRestore(snapshot)}
              >
                Restore Current records
              </button>
            </div>
          </>
        ) : (
          <p className="muted my-4">No snapshot saved in this browser.</p>
        )}
      </Panel>
      <div className="notice">
        This backup file contains the records available in this application. Database backups and
        recovery are not connected.
      </div>
      {restore && (
        <Modal
          title="Restore this backup file?"
          onClose={() => setRestore(null)}
        >
          <p className="muted my-4">
            This replaces the current records with the saved
            snapshot. Changes made after the snapshot will be removed.
          </p>
          <div className="row-actions">
            <button
              className="button"
              onClick={() => {
                if (commit(restore.data)) {
                  notify("Current records restored.");
                  setRestore(null);
                }
              }}
            >
              Restore snapshot
            </button>
            <button
              className="button secondary"
              onClick={() => setRestore(null)}
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
export function TechnicalReports() {
  const { data } = useApp(),
    [type, setType] = useState("accounts");
  const rows = type === "accounts" ? data.users : data.audit;
  return (
    <>
      <PageHead
        title="Technical reports"
        description="Export system accounts and administrative activity."
        action={
          <button
            className="button"
            onClick={() => downloadCSV("agriprice-system-" + type, rows)}
          >
            <Download size={17} />
            Export CSV
          </button>
        }
      />
      <Select
        label="Report"
        value={type}
        onChange={setType}
        options={data.technicalReports}
      />
      <Panel>
        <Records
          rows={rows}
          columns={
            type === "accounts"
              ? [
                  { key: "name", label: "Account" },
                  { key: "role", label: "Role" },
                  { key: "status", label: "Status" },
                  { key: "lastLogin", label: "Last login" },
                ]
              : [
                  { key: "actor", label: "Account" },
                  { key: "action", label: "Action" },
                  { key: "date", label: "Date & time" },
                ]
          }
        />
      </Panel>
    </>
  );
}
