import * as React from "react";
import { Alert } from "react-bootstrap";
import { Button } from "library-simplified-reusable-components";
import ListLoadingIndicator from "./ListLoadingIndicator";

interface Municipality {
  name: string;
  code: string;
}

interface Consortium {
  id: number;
  name: string;
  slug: string;
  municipalities: Municipality[];
}

interface UnmappedCity {
  name: string;
  consortium_id: number | null;
}

interface MunicipalityRegistryData {
  generated_at: string;
  consortiums: Consortium[];
  unassigned_municipalities: Municipality[];
  unmapped_kirkanta_cities: UnmappedCity[];
  email_settings: EmailSettings;
}

interface EmailSettings {
  consortiums: Record<string, string>;
  municipalities: Record<string, string>;
}

interface EmailChange {
  kind: "consortiums" | "municipalities";
  key: string;
  email: string;
  version: number;
}

interface MunicipalityRegistryState {
  data?: MunicipalityRegistryData;
  error?: string;
  saveError?: string;
  saveStatus?: "saving" | "saved";
  isFetching: boolean;
  consortiumEmails: Record<string, string>;
  municipalityEmails: Record<string, string>;
}

/** On-demand view of Kirkanta consortium membership and municipality codes. */
export default class MunicipalityRegistry extends React.Component<
  { csrfToken?: string },
  MunicipalityRegistryState
> {
  private componentIsMounted = false;
  private saveVersion = 0;
  private emailSaveQueue: Promise<void> = Promise.resolve();
  private emailSaveTimers: Record<string, ReturnType<typeof setTimeout>> = {};
  private pendingEmailChanges: Record<string, EmailChange> = {};

  state: MunicipalityRegistryState = {
    isFetching: false,
    consortiumEmails: {},
    municipalityEmails: {},
  };

  componentDidMount() {
    this.componentIsMounted = true;
  }

  componentWillUnmount() {
    this.componentIsMounted = false;
    Object.values(this.emailSaveTimers).forEach(clearTimeout);
    this.emailSaveTimers = {};
    Object.keys(this.pendingEmailChanges).forEach((id) => {
      this.persistEmailChange(this.pendingEmailChanges[id]);
      delete this.pendingEmailChanges[id];
    });
  }

  fetchRegistry = async () => {
    this.setState({ isFetching: true, error: undefined });

    try {
      const response = await fetch("/admin/consortium_municipalities", {
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Kuntarekisterin haku epäonnistui.");
      }

      const emailSettings = result.email_settings || {
        consortiums: {},
        municipalities: {},
      };
      this.setState({
        data: result,
        consortiumEmails: emailSettings.consortiums,
        municipalityEmails: emailSettings.municipalities,
        isFetching: false,
      });
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : String(error),
        isFetching: false,
      });
    }
  };

  updateEmail(kind: EmailChange["kind"], key: string, email: string) {
    const version = ++this.saveVersion;
    if (kind === "consortiums") {
      this.setState((state) => ({
        consortiumEmails: { ...state.consortiumEmails, [key]: email },
        saveStatus: "saving",
        saveError: undefined,
      }));
    } else {
      this.setState((state) => ({
        municipalityEmails: { ...state.municipalityEmails, [key]: email },
        saveStatus: "saving",
        saveError: undefined,
      }));
    }

    const id = `${kind}:${key}`;
    if (this.emailSaveTimers[id]) {
      clearTimeout(this.emailSaveTimers[id]);
    }
    this.pendingEmailChanges[id] = { kind, key, email, version };
    this.emailSaveTimers[id] = setTimeout(() => {
      delete this.emailSaveTimers[id];
      const change = this.pendingEmailChanges[id];
      delete this.pendingEmailChanges[id];
      if (change) {
        this.persistEmailChange(change);
      }
    }, 500);
  }

  persistEmailChange(change: EmailChange) {
    this.emailSaveQueue = this.emailSaveQueue.then(async () => {
      try {
        const headers = new Headers({ "Content-Type": "application/json" });
        if (this.props.csrfToken) {
          headers.set("X-CSRF-Token", this.props.csrfToken);
        }
        const response = await fetch("/admin/consortium_municipality_emails", {
          method: "PUT",
          credentials: "same-origin",
          headers,
          body: JSON.stringify({
            kind: change.kind,
            key: change.key,
            email: change.email,
          }),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(
            result.detail || "Sähköpostiosoitteen tallennus epäonnistui."
          );
        }
        if (this.componentIsMounted && change.version === this.saveVersion) {
          this.setState({ saveStatus: "saved", saveError: undefined });
        }
      } catch (error) {
        if (this.componentIsMounted && change.version === this.saveVersion) {
          this.setState({
            saveStatus: undefined,
            saveError: error instanceof Error ? error.message : String(error),
          });
        }
      }
    });
  }

  renderEmailInput(
    value: string,
    label: string,
    onChange: (value: string) => void
  ): JSX.Element {
    return (
      <input
        type="email"
        className="form-control"
        value={value}
        aria-label={label}
        placeholder="sähköposti@esimerkki.fi"
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  renderMunicipalities(
    municipalities: Municipality[],
    consortiumSlug?: string,
    consortiumEmail = ""
  ): JSX.Element {
    return (
      <table className="table table-striped table-condensed">
        <thead>
          <tr>
            <th>Kunta</th>
            <th>Kuntakoodi</th>
            <th>Sähköposti</th>
          </tr>
        </thead>
        <tbody>
          {municipalities.map((municipality) => (
            <tr key={municipality.code}>
              <td>{municipality.name}</td>
              <td>{municipality.code}</td>
              <td>
                {this.renderEmailInput(
                  this.state.municipalityEmails[municipality.code] || "",
                  `${municipality.name} sähköpostiosoite`,
                  (value) =>
                    this.updateEmail("municipalities", municipality.code, value)
                )}
                <small>
                  Käytössä:{" "}
                  {this.state.municipalityEmails[municipality.code]?.trim() ||
                    consortiumEmail.trim() ||
                    "ei määritetty"}
                </small>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  render(): JSX.Element {
    const { data, error, isFetching, saveError, saveStatus } = this.state;

    return (
      <div className="config-list">
        <h2>Kuntarekisteri</h2>
        <p>
          Hae Kirkannan kirjastokimpat ja kuntien kuntakoodit. Tulokset
          välimuistitetaan vuorokaudeksi.
        </p>
        <Button
          className="left-align"
          callback={this.fetchRegistry}
          content="Hae kuntarekisteri"
          disabled={isFetching}
        />
        {isFetching && <ListLoadingIndicator />}
        {error && <Alert bsStyle="danger">{error}</Alert>}
        {saveError && <Alert bsStyle="danger">{saveError}</Alert>}
        {saveStatus === "saving" && <p>Sähköpostiosoitetta tallennetaan…</p>}
        {saveStatus === "saved" && <p>Sähköpostiosoite tallennettu.</p>}
        {data && (
          <div>
            <p>Tiedot haettu: {new Date(data.generated_at).toLocaleString()}</p>
            <h3>Kirjastokimpat ja niiden kunnat</h3>
            {data.consortiums.map((consortium) => (
              <section key={consortium.id}>
                <h4>
                  <strong>{consortium.name}</strong>{" "}
                  <span
                    style={{
                      display: "inline-block",
                      width: "300px",
                      marginLeft: "12px",
                      verticalAlign: "middle",
                    }}
                  >
                    {this.renderEmailInput(
                      this.state.consortiumEmails[consortium.slug] || "",
                      `${consortium.name} sähköpostiosoite`,
                      (value) =>
                        this.updateEmail("consortiums", consortium.slug, value)
                    )}
                  </span>
                </h4>
                {consortium.municipalities.length > 0 ? (
                  this.renderMunicipalities(
                    consortium.municipalities,
                    consortium.slug,
                    this.state.consortiumEmails[consortium.slug] || ""
                  )
                ) : (
                  <p>Kirkanta ei ilmoita tälle tietueelle kuntajäsenyyksiä.</p>
                )}
              </section>
            ))}

            <h3>Kimpatta olevat kunnat</h3>
            {data.unassigned_municipalities.length > 0 ? (
              this.renderMunicipalities(data.unassigned_municipalities)
            ) : (
              <p>Kaikilla kunnilla on Kirkannan mukaan kimppa.</p>
            )}

            {data.unmapped_kirkanta_cities.length > 0 && (
              <Alert bsStyle="warning">
                <h4>Kunnat, joita ei saatu yhdistettyä kuntakoodiin</h4>
                <ul>
                  {data.unmapped_kirkanta_cities.map((city) => (
                    <li key={`${city.consortium_id}-${city.name}`}>
                      {city.name}
                    </li>
                  ))}
                </ul>
              </Alert>
            )}
          </div>
        )}
      </div>
    );
  }
}
