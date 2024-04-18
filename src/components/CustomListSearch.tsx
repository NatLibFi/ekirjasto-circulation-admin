import * as React from "react";
import { Panel } from "library-simplified-reusable-components";
import { AdvancedSearchQuery, LanguagesData, LibraryData } from "../interfaces";
import { CustomListEditorSearchParams } from "../reducers/customListEditor";
import AdvancedSearchBuilder from "./AdvancedSearchBuilder";
import CustomListSearchQueryViewer from "./CustomListSearchQueryViewer";
import EditableInput from "./EditableInput";
import { useTranslation } from "react-i18next";

export interface CustomListSearchProps {
  autoUpdate?: boolean;
  entryPoints: string[];
  isOwner?: boolean;
  languages: LanguagesData;
  library: LibraryData;
  listId: string;
  searchParams: CustomListEditorSearchParams;
  showAutoUpdate?: boolean;
  startingTitle?: string;
  updateAutoUpdate?: (value: boolean) => void;
  updateSearchParam?: (name: string, value) => void;
  search: () => void;
  addAdvSearchQuery?: (builderName: string, query: AdvancedSearchQuery) => void;
  updateClearFiltersFlag?: (builderName: string, value: boolean) => void;
  updateAdvSearchQueryBoolean?: (
    builderName: string,
    id: string,
    bool: string
  ) => void;
  moveAdvSearchQuery?: (
    builderName: string,
    id: string,
    targetId: string
  ) => void;
  removeAdvSearchQuery?: (builderName: string, id: string) => void;
  selectAdvSearchQuery?: (builderName: string, id: string) => void;
}

const CustomListSearch = ({
  autoUpdate,
  entryPoints,
  isOwner,
  library,
  listId,
  searchParams,
  showAutoUpdate,
  startingTitle,
  updateAutoUpdate,
  updateSearchParam,
  search,
  addAdvSearchQuery,
  updateClearFiltersFlag,
  updateAdvSearchQueryBoolean,
  moveAdvSearchQuery,
  removeAdvSearchQuery,
  selectAdvSearchQuery,
}: CustomListSearchProps) => {
  React.useEffect(() => {
    if (startingTitle) {
      addAdvSearchQuery?.("include", {
        key: "title",
        op: "eq",
        value: startingTitle,
      });

      search?.();
    }
  }, []);

  const { t } = useTranslation();

  const sorts = [
    { value: null, label: t("common.labelRelevance") },
    { value: "title", label: t("common.labelTitle") },
    { value: "author", label: t("common.labelAuthor") },
  ];

  const readOnly = !isOwner;

  const entryPointsWithAll = entryPoints.includes("All")
    ? entryPoints
    : ["All", ...entryPoints];

  const selectedEntryPoint = searchParams.entryPoint.toLowerCase();

  const renderAdvancedSearchBuilder = (name: string) => {
    const builder = searchParams.advanced[name];

    return (
      <AdvancedSearchBuilder
        isOwner={isOwner}
        name={name}
        query={builder.query}
        selectedQueryId={builder.selectedQueryId}
        addQuery={addAdvSearchQuery}
        updateClearFiltersFlag={updateClearFiltersFlag}
        updateQueryBoolean={updateAdvSearchQueryBoolean}
        moveQuery={moveAdvSearchQuery}
        removeQuery={removeAdvSearchQuery}
        selectQuery={selectAdvSearchQuery}
      />
    );
  };

  const searchForm = (
    <div className="search-titles">
      <div className="entry-points">
        <span>{t("customListSearch.searchFor")}</span>

        <div className="entry-points-selection">
          {entryPointsWithAll.map((entryPoint) => (
            <EditableInput
              disabled={readOnly}
              key={entryPoint}
              type="radio"
              name="entry-points-selection"
              checked={entryPoint.toLowerCase() === selectedEntryPoint}
              label={entryPoint}
              value={entryPoint}
              onChange={() => updateSearchParam?.("entryPoint", entryPoint)}
            />
          ))}
        </div>
      </div>

      <div className="search-options">
        <span>{t("customListSearch.sortByLabel")}</span>

        <div className="search-options-selection">
          {sorts.map(({ value, label }) => (
            <EditableInput
              disabled={readOnly}
              key={value}
              type="radio"
              name="sort-selection"
              value={value}
              label={label}
              checked={value === searchParams.sort}
              onChange={() => updateSearchParam?.("sort", value)}
            />
          ))}
        </div>

        <aside>{t("customListSearch.sortByDescription")}</aside>
      </div>

      <div className="search-builders">
        <Panel
          headerText={t("customListSearch.worksToInclude")}
          id="search-filters-include"
          openByDefault={true}
          content={renderAdvancedSearchBuilder("include")}
        />

        <Panel
          headerText={t("customListSearch.worksToExclude")}
          id="search-filters-exclude"
          openByDefault={false}
          content={renderAdvancedSearchBuilder("exclude")}
        />
      </div>

      <div key="query-viewer">
        <CustomListSearchQueryViewer
          library={library?.short_name}
          searchParams={searchParams}
        />
      </div>

      {showAutoUpdate && (
        <div className="auto-update">
          <span>{t("customListSearch.useSearchTo")}</span>

          <div className="auto-update-selection">
            <div>
              <EditableInput
                disabled={readOnly || !!listId}
                type="radio"
                name="auto-update"
                checked={autoUpdate}
                label={t("customListSearch.automaticUpdateLabel")}
                onChange={() => updateAutoUpdate?.(true)}
              />

              <aside>
                {t("customListSearch.automaticUpdateDescription")}{" "}
                {!readOnly &&
                  t("customListSearch.automaticUpdateDescriptionExtra")}
              </aside>
            </div>

            <div>
              <EditableInput
                disabled={readOnly || !!listId}
                type="radio"
                name="auto-update"
                checked={!autoUpdate}
                label={t("customListSearch.manualSelectLabel")}
                onChange={() => updateAutoUpdate?.(false)}
              />

              <aside>
                {t("customListSearch.manualSelectDescription")}{" "}
                {!readOnly &&
                  t("customListSearch.manualSelectDescriptionExtra")}
              </aside>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Panel
      headerText={t("customListSearch.searchForTitles")}
      id="search-titles"
      openByDefault={true}
      onEnter={search}
      content={searchForm}
    />
  );
};

export default CustomListSearch;
