import * as React from "react";
import EditableInput from "./EditableInput";
import EditorField from "./EditorField";
import { Form } from "library-simplified-reusable-components";
import {
  BookData,
  ContributorData,
  RolesData,
  MediaData,
  LanguagesData,
} from "../interfaces";
import LanguageField from "./LanguageField";
import { formatString } from "../utils/sharedFunctions";
import Contributors from "./Contributors";

export interface BookEditFormProps extends BookData {
  roles: RolesData;
  media: MediaData;
  languages: LanguagesData;
  disabled: boolean;
  refresh: () => any;
  editBook: (url: string, data: FormData) => Promise<any>;
}

export interface BookEditFormState {
  contributors?: ContributorData[];
}

/** Edit a book's metadata in the edit tab on the book details page. */
export default class BookEditForm extends React.Component<
  BookEditFormProps,
  BookEditFormState
> {
  private summaryRef = React.createRef<EditorField>();
  defaultContent = "<p>Update the summary for this book.</p>";

  constructor(props) {
    super(props);
    this.state = {
      contributors: (props.authors || []).concat(props.contributors || []),
    };
    this.renderForm = this.renderForm.bind(this);
  }

  render(): JSX.Element {
    return (
      <Form
        onSubmit={this.save.bind(this)}
        className="edit-form"
        content={this.renderForm()}
        disableButton={this.props.disabled}
      />
    );
  }

  renderTextField(
    name: string,
    placeholder?: string,
    value?: string,
    hasLabel = true
  ): JSX.Element {
    const formattedName = formatString(name);
    const ariaLabel = !hasLabel ? `Field for ${formattedName}` : null;
    return (
      <EditableInput
        elementType="input"
        type="text"
        disabled={this.props.disabled}
        name={name}
        label={hasLabel && formattedName}
        aria-label={ariaLabel}
        value={value || this.props[name]}
        optionalText={false}
        placeholder={placeholder}
      />
    );
  }

  renderForm() {
    const mediumValue = this.getMedium(this.props.medium);
    const seriesPosition =
      this.props.seriesPosition !== undefined &&
      this.props.seriesPosition !== null &&
      String(this.props.seriesPosition);
    return (
      <fieldset key="book-info">
        <legend className="visuallyHidden">Edit Book Metadata</legend>
        {this.renderTextField("title")}
        {this.renderTextField("subtitle")}
        <Contributors
          disabled={this.props.disabled}
          roles={this.props.roles}
          contributors={this.state.contributors}
        />
        <div className="form-group">
          <label>Series</label>
          <div className="form-inline">
            {this.renderTextField("series", "Name", null, false)}
            <span>&nbsp;&nbsp;</span>
            {this.renderTextField(
              "series_position",
              "#",
              seriesPosition,
              false
            )}
          </div>
        </div>
        <EditableInput
          elementType="select"
          disabled={this.props.disabled}
          name="medium"
          label="Medium"
          value={mediumValue}
        >
          {this.props.media &&
            Object.values(this.props.media).map((medium, idx) => (
              <option
                key={`${medium}-${idx}`}
                value={medium}
                aria-selected={mediumValue === medium}
              >
                {medium}
              </option>
            ))}
        </EditableInput>
        <LanguageField
          disabled={this.props.disabled}
          languages={this.props.languages}
          name="language"
          label="Language"
          value={this.props.language}
        />
        {this.renderTextField("publisher")}
        {this.renderTextField("imprint")}
        <EditableInput
          elementType="input"
          type="date"
          disabled={this.props.disabled}
          name="issued"
          label="Publication Date"
          value={this.props.issued}
          optionalText={false}
        />
        <EditableInput
          elementType="input"
          type="number"
          disabled={this.props.disabled}
          name="rating"
          label="Rating (1-5, higher is better)"
          min={1}
          max={5}
          value={this.props.rating && String(Math.round(this.props.rating))}
          optionalText={false}
        />
        <div className="editor form-group">
          <label className="control-label">Summary</label>
          <EditorField
            ref={this.summaryRef}
            content={this.props.summary}
            defaultContent={this.defaultContent}
            disabled={this.props.disabled}
          />
        </div>
      </fieldset>
    );
  }

  getMedium(additionalTypeOrMedium) {
    if (this.props.media) {
      if (this.props.media[additionalTypeOrMedium]) {
        return this.props.media[additionalTypeOrMedium];
      }
    }
    return additionalTypeOrMedium;
  }

  save(data: FormData) {
    const summary = this.summaryRef.current.getValue();
    // Only update the summary if it was intentionally updated.
    if (summary !== this.defaultContent) {
      data.append("summary", summary);
    }
    this.props.editBook(this.props.editLink.href, data).then((response) => {
      this.props.refresh();
    });
  }
}
