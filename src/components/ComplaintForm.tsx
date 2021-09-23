import * as React from "react";
import EditableInput from "./EditableInput";
import { PostComplaint } from "../interfaces";
import { Button, Form } from "library-simplified-reusable-components";
import { formatString } from "../utils/sharedFunctions";

export interface ComplaintFormProps {
  disabled?: boolean;
  complaintUrl: string;
  postComplaint: PostComplaint;
  refreshComplaints: () => void;
}

/** Form for adding a new complaint to a book, from the complaints tab of the book detail page. */
export default class ComplaintForm extends React.Component<
  ComplaintFormProps,
  any
> {
  private typeRef = React.createRef<EditableInput>();
  constructor(props) {
    super(props);
    this.state = { errors: [] };
    this.post = this.post.bind(this);
  }

  render(): JSX.Element {
    const complaintTypes = [
      "cannot-issue-loan",
      "cannot-render",
      "wrong-title",
      "wrong-author",
      "wrong-audience",
      "cannot-fulfill-loan",
      "bad-description",
      "cannot-return",
      "bad-cover-image",
      "wrong-medium",
      "wrong-age-range",
      "wrong-genre",
    ];

    return (
      <div className="complaint-form">
        <Form
          key="complaints"
          onSubmit={this.post}
          className="edit-form"
          disableButton={this.props.disabled}
          errorText={
            !!this.state.errors.length &&
            this.state.errors.map((error, i) => <div key={i}>{error}</div>)
          }
          content={
            <fieldset key="add-complaint">
              <legend>Add Complaint</legend>
              <EditableInput
                elementType="select"
                ref={this.typeRef}
                name="type"
                placeholder=""
                aria-label="Select a complaint type"
                disabled={this.props.disabled}
              >
                <option value="" aria-selected={false}>
                  Complaint type
                </option>
                {complaintTypes.map((type) => (
                  <option key={type} value={type} aria-selected={false}>
                    {formatString(type, ["-"])}
                  </option>
                ))}
              </EditableInput>
            </fieldset>
          }
        />
      </div>
    );
  }

  post(complaint) {
    const value = complaint.get("type");

    if (value) {
      this.setState({ errors: [] });
    } else {
      this.setState({ errors: ["You must select a complaint type!"] });
      return;
    }

    const data = {
      type: "http://librarysimplified.org/terms/problem/" + value,
    };

    this.props
      .postComplaint(this.props.complaintUrl, data)
      .then((response) => {
        this.props.refreshComplaints();
        this.clear();
      })
      .catch((err) => {
        this.showPostError();
      });
  }

  showPostError() {
    this.setState({ errors: ["Couldn't post complaint."] });
  }

  clear() {
    this.typeRef.current.clear();
  }
}
