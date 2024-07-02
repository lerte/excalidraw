import type { ExcalidrawProps, UIAppState } from "../types";
import { useEffect, useRef, useState, useTransition } from "react";

import { Dialog } from "./Dialog";
import { TextField } from "./TextField";
import { t } from "../i18n";
import { useApp } from "./App";

type Stats = Record<
  string,
  {
    total: number;
    week: number;
  }
>;

type Library = {
  name: string;
  description: string;
  authors: {
    name: string;
    url: string;
  }[];
  source: string;
  preview: string;
  created: string;
  updated: string;
  version: number;
  id: string;
  itemNames?: string[];
};

const LibraryMenuBrowseButton = (_props: {
  libraryReturnUrl: ExcalidrawProps["libraryReturnUrl"];
  theme: UIAppState["theme"];
  id: string;
}) => {
  const app = useApp();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [stats, setStats] = useState<Stats>({
    "": {
      total: 0,
      week: 0,
    },
  });
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [filterLibraries, setFilterLibraries] = useState<Library[]>([]);

  useEffect(() => {
    getLibraries();
    getStats();
  }, []);

  useEffect(() => {
    const reg = new RegExp(searchText, "i");
    startTransition(() => {
      // 全局搜索的item有name,description,itemNames
      const result = libraries.filter((library) => {
        if (reg.test(library.name)) {
          return true;
        }
        if (reg.test(library.description)) {
          return true;
        }
        if (library.itemNames?.find((itemName) => reg.test(itemName))) {
          return true;
        }
      });

      setFilterLibraries(result);
    });
  }, [searchText]);

  const getLibraries = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_APP_LIBRARY_URL}/libraries.json`
    );
    const data = await response.json();
    setLibraries(data);
    setFilterLibraries(data);
  };

  const getStats = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_APP_LIBRARY_URL}/stats.json`
    );
    const data = await response.json();
    setStats(data);
  };

  const handleAddToLibrary = async (library: Library) => {
    const response = await fetch(
      `${import.meta.env.VITE_APP_LIBRARY_URL}/libraries/${library.source}`
    );
    const data = await response.json();

    await app.library.updateLibrary({
      defaultStatus: "published",
      libraryItems: data.library,
      merge: true,
    });
  };

  return (
    <>
      {open && (
        <Dialog
          size="wide"
          className="*:[overflow-x:hidden]"
          title="Excalidraw Libraries"
          onCloseRequest={() => setOpen(false)}
        >
          <section className="sticky top-4 bg-white dark:bg-black shadow-xl">
            <TextField
              ref={inputRef}
              value={searchText}
              onChange={(value) => {
                setSearchText(value);
              }}
              placeholder={t("commandPalette.search.placeholder")}
            />
          </section>

          <ul>
            {filterLibraries.map((library) => (
              <li
                key={
                  library.id ||
                  library.source.replace(".excalidrawlib", "").replace("/", "-")
                }
              >
                <div className="flex flex-col gap-4 py-8">
                  <h2 className="text-2xl">{library.name}</h2>
                  <p className="text-base">
                    {library.authors.map(({ name, url }) => (
                      <a
                        key={name}
                        href={url}
                        target="_blank"
                      >
                        👨🏻‍💼{name}
                      </a>
                    ))}
                  </p>
                  <p className="flex gap-4">
                    <span>
                      ⬇️Total downloads:
                      {
                        stats[
                          library.source
                            .replace(".excalidrawlib", "")
                            .replace("/", "-")
                        ]?.total
                      }
                    </span>
                    <span>
                      ⬇️Downloads this week:
                      {
                        stats[
                          library.source
                            .replace(".excalidrawlib", "")
                            .replace("/", "-")
                        ]?.week
                      }
                    </span>
                  </p>
                  <p className="flex gap-4">
                    <span>🕒Created: {library.created}</span>
                    <span>⬆️Updated: {library.updated}</span>
                  </p>
                  <p>{library.description}</p>
                  {library.itemNames && (
                    <p>Items: {library.itemNames?.toString()}</p>
                  )}
                  <div className="overflow-hidden rounded-xl bg-white dark:[filter:invert(93%)_hue-rotate(180deg)]">
                    <img
                      src={`${import.meta.env.VITE_APP_LIBRARY_URL}/libraries/${
                        library.preview
                      }`}
                    />
                  </div>
                </div>
                <div className="pb-8 border-b">
                  <button
                    onClick={() => handleAddToLibrary(library)}
                    className="py-2 px-4 rounded whitespace-nowrap text-[--primary] font-semibold border border-solid border-[--primary]"
                  >
                    ➡️ Add to Excalidraw
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Dialog>
      )}
      <button
        onClick={() => setOpen(true)}
        className="library-menu-browse-button"
      >
        {t("labels.libraries")}
      </button>
    </>
  );
};

export default LibraryMenuBrowseButton;
