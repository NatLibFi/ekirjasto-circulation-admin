import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import ActionCreator from "../../actions";
import { CustomListData } from "../../interfaces";
import { AllWork } from "../../reducers/allWorks";
import { bookListsUrl } from "../../utils/allWorks";

interface WorkListActionProps {
  work: AllWork;
  customLists: CustomListData[];
  csrfToken?: string;
}

export default function WorkListAction({
  work,
  customLists,
  csrfToken,
}: WorkListActionProps) {
  const dispatch = useDispatch();
  const [selectedList, setSelectedList] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = useRef(true);
  useEffect(
    () => () => {
      active.current = false;
    },
    []
  );

  async function addToList() {
    const listId = selectedList;
    const list = customLists.find((item) => String(item.id) === listId);
    const url = bookListsUrl(work.admin_url);
    if (!list || !url) {
      setError("Teoksen listatoiminnon osoitetta ei löytynyt.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const actions = new ActionCreator(null, csrfToken);
      const current = await dispatch(
        actions.fetchCustomListsForBook(url) as any
      );
      const memberships: CustomListData[] = current?.custom_lists || [];
      if (!memberships.some((item) => String(item.id) === listId)) {
        const form = new FormData();
        form.append("lists", JSON.stringify([...memberships, list]));
        await dispatch(actions.editCustomListsForBook(url, form) as any);
      }
      if (active.current)
        setSelectedList((value) => (value === listId ? "" : value));
    } catch (requestError) {
      if (active.current)
        setError(
          `Kirjan lisääminen listalle epäonnistui${
            requestError.status ? ` (${requestError.status})` : ""
          }: ${
            requestError.response || requestError.message || "Yritä uudelleen."
          }`
        );
    } finally {
      if (active.current) setPending(false);
    }
  }

  return (
    <>
      <select
        aria-label={`Valitse lista teokselle ${work.title}`}
        value={selectedList}
        disabled={pending}
        onChange={(event) => setSelectedList(event.target.value)}
      >
        <option value="">Lisää listalle…</option>
        {customLists
          .filter((list) => list.name)
          .map((list) => (
            <option key={list.id} value={String(list.id)}>
              {list.name}
            </option>
          ))}
      </select>
      <button
        type="button"
        className="btn btn-default"
        disabled={!selectedList || pending}
        onClick={addToList}
      >
        {pending ? "Lisätään…" : "Lisää"}
      </button>
      {error && <span role="alert">{error}</span>}
    </>
  );
}
