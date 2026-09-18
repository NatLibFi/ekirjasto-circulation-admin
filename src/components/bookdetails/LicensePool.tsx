import * as React from "react";
import { FetchErrorData } from "@natlibfi/ekirjasto-web-opds-client/lib/interfaces";
import {
  CirculationData,
  CirculationHold,
  CirculationLicense,
  CirculationLoan,
  LicensePoolData,
} from "../../interfaces";

export interface LicensePoolProps {
  data?: CirculationData;
  isFetching?: boolean;
  fetchError?: FetchErrorData;
}

interface LicenseTableRowsProps {
  license: CirculationLicense;
}

interface LoanTableRowsProps {
  loan: CirculationLoan;
}

/** Displays license pool, license, and loan information. */
export class LicensePool extends React.Component<LicensePoolProps> {
  render(): JSX.Element {
    const { data, isFetching, fetchError } = this.props;
    return (
      <section className="custom-book-table-section license-pool-information">
        <h2>License pool information</h2>
        {isFetching && !data ? (
          <table className="custom-book-table">
            <tbody>{renderBookTableRow("Status", "Loading…")}</tbody>
          </table>
        ) : fetchError ? (
          <table className="custom-book-table">
            <tbody>
              {renderBookTableRow(
                "Status",
                "License pool information could not be loaded"
              )}
            </tbody>
          </table>
        ) : data && data.license_pools.length ? (
          data.license_pools.map((pool) => (
            <LicensePoolTables key={pool.pool_id} pool={pool} />
          ))
        ) : (
          <table className="custom-book-table">
            <tbody>{renderBookTableRow("License pools", "—")}</tbody>
          </table>
        )}
      </section>
    );
  }
}

function LicensePoolTables({ pool }: { pool: LicensePoolData }): JSX.Element {
  return (
    <div className="license-pool-tables">
      <LicensePoolTable pool={pool} />
      <HoldInformationSection holds={pool.holds || []} />
      <LicenseInformationSection licenses={pool.licenses} />
      {/* We do not have license pool level loans at the moment */}
      {/* <LoanInformationSection loans={pool.loans || []} /> */}
    </div>
  );
}

function LicensePoolTable({ pool }: { pool: LicensePoolData }): JSX.Element {
  return (
    <table className="custom-book-table">
      <tbody>
        {renderBookTableRow(
          "Licensepool created",
          formatDateValue(pool.availability_time)
        )}
        {renderBookTableRow("Licenses owned (total concurrency)", pool.licenses_owned)}
        {renderBookTableRow("Licenses available", pool.licenses_available)}
        {renderBookTableRow("Holds", pool.patrons_in_hold_queue ?? 0)}
        {renderBookTableRow(
          "Holds to concurrency ratio",
          pool.patrons_in_hold_queue !== null &&
            pool.patrons_in_hold_queue !== undefined &&
            pool.licenses_owned
            ? `${((pool.patrons_in_hold_queue / pool.licenses_owned) * 100).toFixed(1)}%`
            : ""
        )}
        {renderBookTableRow("Licenses reserved (ready to checkout)", pool.licenses_reserved)}
        {renderBookTableRow("Open access", String(pool.open_access))}
        {renderBookTableRow("Unlimited access", String(pool.unlimited_access))}
        {renderBookTableRow("Hidden", String(pool.suppressed))}
      </tbody>
    </table>
  );
}

function LicenseInformationSection({
  licenses,
}: {
  licenses: CirculationLicense[];
}): JSX.Element {
  return (
    <section className="license-pool-data-section license-information-section">
      <h2>Licenses ({licenses.length})</h2>
      <div className="license-pool-record-tables">
        {licenses.length ? (
          licenses.map((license, index) => (
            <LicenseInformation
              key={license.id}
              license={license}
              position={index + 1}
            />
          ))
        ) : (
          <table className="custom-book-table">
            <tbody>{renderBookTableRow("Licenses", "—")}</tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function LicenseInformation({
  license,
  position,
}: LicenseTableRowsProps & { position: number }): JSX.Element {
  return (
    <div className="license-information">
      <LicenseInformationTable license={license} position={position} />
      <LoanInformationSection loans={license.loans} />
    </div>
  );
}

function LicenseInformationTable({
  license,
  position,
}: LicenseTableRowsProps & { position: number }): JSX.Element {
  return (
    <table className="custom-book-table">
      <caption>License ({position})</caption>
      <tbody>
        <LicenseTableRows license={license} />
      </tbody>
    </table>
  );
}

function LoanInformationSection({
  loans,
}: {
  loans: CirculationLoan[];
}): JSX.Element {
  return (
    <details className="license-pool-data-section">
      <summary>Active Loans{loans.length ? ` (${loans.length})` : " (0)"}</summary>
      <div className="license-pool-record-tables">
        {loans.length ? (
          loans.map((loan) => <LoanInformationTable key={loan.id} loan={loan} />)
        ) : (
          <table className="custom-book-table">
            <tbody>{renderBookTableRow("Loans", "No loans")}</tbody>
          </table>
        )}
      </div>
    </details>
  );
}

function HoldInformationSection({
  holds,
}: {
  holds: CirculationHold[];
}): JSX.Element {
  return (
    <details className="license-pool-data-section">
      <summary>Holds{holds.length ? ` (${holds.length})` : " (0)"}</summary>
      <div className="license-pool-record-tables">
        {holds.length ? (
          holds.map((hold) => <HoldInformationTable key={hold.id} hold={hold} />)
        ) : (
          <table className="custom-book-table">
            <tbody>{renderBookTableRow("Holds", "No holds")}</tbody>
          </table>
        )}
      </div>
    </details>
  );
}

function LoanInformationTable({ loan }: LoanTableRowsProps): JSX.Element {
  return (
    <table className="custom-book-table">
      <caption>Loan ({loan.id})</caption>
      <tbody>
        <LoanTableRows loan={loan} />
      </tbody>
    </table>
  );
}

function HoldInformationTable({ hold }: { hold: CirculationHold }): JSX.Element {
  return (
    <table className="custom-book-table">
      <caption>Hold ({hold.id})</caption>
      <tbody>
        <HoldTableRows hold={hold} />
      </tbody>
    </table>
  );
}

function LicenseTableRows({ license }: LicenseTableRowsProps): JSX.Element {
  return (
    <React.Fragment key={license.id}>
      {renderBookTableRow("License identifier (datasource)", license.identifier)}
      {renderBookTableRow("License ID (database)", license.id)}
      {renderBookTableRow("License status", license.status)}
      {renderBookTableRow("Concurrency", license.terms_concurrency)}
      {renderBookTableRow("Checkouts available", license.checkouts_available)}
      {renderBookTableRow("Checkouts left", license.checkouts_left)}
      {renderBookTableRow("Expires", formatDateValue(license.expires, true))}
      <tr className="license-additional-fields-row">
        <td colSpan={2}>
          <LicenseAdditionalFieldsDetails license={license} />
        </td>
      </tr>
    </React.Fragment>
  );
}

function LicenseAdditionalFieldsDetails({
  license,
}: LicenseTableRowsProps): JSX.Element {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <details
      className="license-additional-fields"
      onToggle={(event: React.SyntheticEvent<HTMLDetailsElement>) =>
        setExpanded(event.currentTarget.open)
      }
    >
      <summary aria-expanded={expanded}>
        {expanded ? "Show less" : "Show more"}
      </summary>
      <table className="custom-book-table">
        <tbody>
          {renderBookTableRow("Checkout URL", license.checkout_url)}
          {renderBookTableRow(
            "Currently available loans",
            license.currently_available_loans
          )}
          {renderBookTableRow(
            "Total remaining loans (min(concurrency, checkouts left))",
            license.total_remaining_loans
          )}
          {renderBookTableRow("Inactive", String(license.is_inactive))}
          {renderBookTableRow("Loan pool", String(license.is_loan_limited))}
          {renderBookTableRow("Time limited", String(license.is_time_limited))}
          {renderBookTableRow("Perpetual", String(license.is_perpetual))}
          {renderBookTableRow("Missing from feed", String(license.is_missing))}
          {renderBookTableRow(
            "Last checked in feed",
            formatDateValue(license.last_checked)
          )}
        </tbody>
      </table>
    </details>
  );
}

function LoanTableRows({ loan }: LoanTableRowsProps): JSX.Element {
  return (
    <React.Fragment key={loan.id}>
      {renderBookTableRow("License identifier", loan.license_id)}
      {renderBookTableRow("Loan start", formatDateValue(loan.start, true))}
      {renderBookTableRow("Loan end", formatDateValue(loan.end, true))}
    </React.Fragment>
  );
}

function HoldTableRows({ hold }: { hold: CirculationHold }): JSX.Element {
  return (
    <React.Fragment key={hold.id}>
      {renderBookTableRow("Hold position", hold.position)}
      {renderBookTableRow("Hold start", formatDateValue(hold.start, true))}
      {renderBookTableRow("Hold end", formatDateValue(hold.end, true))}
    </React.Fragment>
  );
}

function formatDateValue(value: string | null, includeTime = false): string | null {
  return value ? formatDate(value, includeTime) : null;
}

function formatDate(value: string, includeTime = false): string {
  const date = new Date(value);
  return isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        ...(includeTime && {
          hour: "numeric",
          minute: "2-digit",
        }),
        timeZone: "UTC",
      });
}

function renderBookTableRow(
  name: string,
  value: string | number | string[] | null | undefined | JSX.Element
) {
  const values = Array.isArray(value) ? value : [value];
  const displayValues =
    values.length &&
    values.some((item) => item !== null && item !== undefined && item !== "")
      ? values
      : [""];
  const className = name.toLowerCase().replace(/\s/g, "-");

  return displayValues.map((item, index) => (
    <tr key={`${name}-${index}`} className={className}>
      <th scope="row">{index === 0 ? name : null}</th>
      <td>{item ?? ""}</td>
    </tr>
  ));
}

export default LicensePool;
