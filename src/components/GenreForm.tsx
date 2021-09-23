import * as React from "react";
import { GenreData } from "../interfaces";
import { Button } from "library-simplified-reusable-components";

export interface GenreFormProps {
  genreOptions: GenreData[];
  bookGenres: string[];
  addGenre: (genre: string) => void;
  disabled?: boolean;
}

export interface GenreFormState {
  genre: string | null;
  subgenre: string | null;
}

/** Form for selecting a genre to add to a book, used on the classifications tab
    of the book detail page. */
export default class GenreForm extends React.Component<
  GenreFormProps,
  GenreFormState
> {
  constructor(props) {
    super(props);
    this.state = {
      genre: null,
      subgenre: null,
    };
    this.handleGenreSelect = this.handleGenreSelect.bind(this);
    this.handleSubgenreSelect = this.handleSubgenreSelect.bind(this);
    this.addGenre = this.addGenre.bind(this);
  }

  render(): JSX.Element {
    let subgenres = null;
    if (this.state.genre) {
      const genre = this.props.genreOptions.find(
        (genre) => genre.name === this.state.genre
      );
      if (genre) {
        subgenres = genre.subgenres.sort();
      }
    }

    const disabledProps = this.props.disabled ? { disabled: true } : {};

    return (
      <div className="genre-form">
        <div className="form-inline">
          <select
            name="genre"
            aria-label="Select one of the following genres"
            size={this.topLevelGenres().length}
            className="form-control"
            {...disabledProps}
          >
            {this.topLevelGenres().map((genre) => (
              <option
                key={genre.name}
                value={genre.name}
                disabled={this.bookHasGenre(genre.name)}
                onClick={this.handleGenreSelect}
                aria-selected={genre.name === this.state.genre}
              >
                {genre.name + (genre.subgenres.length > 0 ? " >" : "")}
              </option>
            ))}
          </select>

          {subgenres && subgenres.length > 0 && (
            <select
              name="subgenre"
              size={subgenres.length}
              className="form-control subgenres"
              {...disabledProps}
            >
              {subgenres.map((genre) => (
                <option
                  key={genre}
                  value={genre}
                  disabled={this.bookHasGenre(genre)}
                  onClick={this.handleSubgenreSelect}
                  aria-selected={genre === this.state.subgenre}
                >
                  {genre}
                </option>
              ))}
            </select>
          )}

          {this.state.genre && (
            <Button
              className="top-align"
              callback={this.addGenre}
              content="Add"
            />
          )}
        </div>
      </div>
    );
  }

  topLevelGenres() {
    return this.props.genreOptions.filter(
      (genre) => genre.parents.length === 0
    );
  }

  bookHasGenre(genre) {
    return this.props.bookGenres.indexOf(genre) !== -1;
  }

  handleGenreSelect(event) {
    this.setState({ genre: event.target.value, subgenre: null });
  }

  handleSubgenreSelect(event) {
    this.setState({ genre: this.state.genre, subgenre: event.target.value });
  }

  resetForm() {
    this.setState({ genre: null, subgenre: null });
  }

  addGenre() {
    const newGenre = this.state.subgenre || this.state.genre;
    this.props.addGenre(newGenre);
    this.resetForm();
  }
}
