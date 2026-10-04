import type { Practice } from "../../types";
import { commandLineTools as commandLineToolsPractice, projectResultsAnalysis as projectResultsAnalysisPractice } from "./more";

export const advanced: Record<string, Practice> = {
  "decorators-and-context-managers": {
    solution: {
      notes: [
        "`require_role` takes an argument, so it is a function that returns the real decorator. The wrapper checks the `user` argument before calling the original function. `timer` is a generator-based context manager: the code before `yield` runs on entry, and `finally` runs on exit even if the block raises.",
      ],
      code: [
        {
          filename: "roles.py",
          lang: "python",
          source: `
import time
from collections.abc import Callable, Iterator
from contextlib import contextmanager
from functools import wraps
from typing import Any


def require_role(role: str) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(func)
        def wrapper(user: dict[str, str], *args: Any, **kwargs: Any) -> Any:
            if user.get("role") != role:
                raise PermissionError(f"{func.__name__} requires role {role!r}")
            return func(user, *args, **kwargs)
        return wrapper
    return decorator


@contextmanager
def timer(label: str) -> Iterator[None]:
    start = time.perf_counter()
    try:
        yield
    finally:
        print(f"{label} took {(time.perf_counter() - start) * 1000:.1f} ms")


@require_role("admin")
def delete_results(user: dict[str, str], term: int) -> str:
    return f"{user['name']} deleted term {term} results"


with timer("admin action"):
    print(delete_results({"name": "Head Teacher", "role": "admin"}, 2))

try:
    delete_results({"name": "Juma", "role": "student"}, 2)
except PermissionError as err:
    print("Denied:", err)
print(delete_results.__name__)   # delete_results (kept by functools.wraps)
`,
        },
      ],
    },
    quiz: [
      {
        question: "What is a decorator?",
        options: [
          "A function that takes a function and returns an improved version of it",
          "A special kind of class",
          "A comment that changes formatting",
          "A built-in type",
        ],
        answer: 0,
        explanation: "`@timed` above `def f` is shorthand for `f = timed(f)`.",
      },
      {
        question: "Why use `functools.wraps` inside a decorator?",
        options: [
          "It makes the function faster",
          "It is required for decorators to work",
          "It keeps the original function's name and docstring on the wrapper",
          "It caches results",
        ],
        answer: 2,
        explanation: "Without it, the wrapped function would be called `wrapper` in tracebacks and docs.",
      },
      {
        question: "What does `@lru_cache` do?",
        options: [
          "Logs every call",
          "Remembers results for previous arguments so repeat calls are instant",
          "Runs the function in a thread",
          "Limits how often a function can be called",
        ],
        answer: 1,
        explanation: "Memoisation turns slow recursive functions such as Fibonacci into fast ones.",
      },
      {
        question: "In a `@contextmanager` function, where should cleanup code go?",
        options: [
          "Before the `yield`",
          "In a separate function",
          "In the caller",
          "In a `finally` block around the `yield`",
        ],
        answer: 3,
        explanation: "`finally` runs even when the `with` block raises an exception.",
      },
    ],
  },

  "advanced-typing": {
    solution: {
      notes: [
        "A generic `Protocol` describes any repository by its methods. `InMemoryRepository` never mentions the protocol, yet mypy accepts it wherever a `Repository[Student]` is expected because its methods match. `top_student` works with any implementation — in-memory now, PostgreSQL later.",
      ],
      code: [
        {
          filename: "repository.py",
          lang: "python",
          source: `
from dataclasses import dataclass
from typing import Generic, Protocol, TypeVar

T = TypeVar("T")


class Repository(Protocol[T]):
    def get(self, item_id: str) -> T | None: ...
    def add(self, item: T) -> None: ...
    def all(self) -> list[T]: ...


@dataclass
class Student:
    id: str
    name: str
    average: float


class InMemoryRepository(Generic[T]):
    def __init__(self, key: str = "id") -> None:
        self._items: dict[str, T] = {}
        self._key = key

    def get(self, item_id: str) -> T | None:
        return self._items.get(item_id)

    def add(self, item: T) -> None:
        self._items[getattr(item, self._key)] = item

    def all(self) -> list[T]:
        return list(self._items.values())


def top_student(repo: Repository[Student]) -> Student | None:
    return max(repo.all(), key=lambda s: s.average, default=None)


repo: InMemoryRepository[Student] = InMemoryRepository()
repo.add(Student("s1", "Amina", 86.0))
repo.add(Student("s2", "Juma", 54.0))

best = top_student(repo)
print(best.name if best else "nobody", repo.get("s2"))
`,
        },
      ],
    },
    quiz: [
      {
        question: "How does a class satisfy a `Protocol`?",
        options: [
          "It must inherit from the Protocol",
          "It must be registered with `@protocol`",
          "By having methods with matching names and signatures — no inheritance needed",
          "It must be a dataclass",
        ],
        answer: 2,
        explanation: "Protocols use structural typing: the shape is what counts.",
      },
      {
        question: "What does `Stack[int]` guarantee for a generic `class Stack(Generic[T])`?",
        options: [
          "That the type checker only accepts ints being pushed and treats popped values as ints",
          "That Python converts values to int",
          "That the stack is sorted",
          "Nothing at all",
        ],
        answer: 0,
        explanation: "The type parameter is fixed to `int` for that stack, and checked by mypy.",
      },
      {
        question: "What is `@overload` used for?",
        options: [
          "Making a function run faster",
          "Allowing two functions with the same name at runtime",
          "Caching results",
          "Describing a function whose return type depends on its argument types",
        ],
        answer: 3,
        explanation: "Overloads tell the type checker, for example, that `str` in gives `int` out and `list[str]` gives `list[int]`.",
      },
      {
        question: "Why are Protocols handy for testing?",
        options: [
          "They make tests run in parallel",
          "A simple fake class can stand in for a real dependency as long as it has the same methods",
          "They generate test data",
          "They replace pytest",
        ],
        answer: 1,
        explanation: "Code typed against a Protocol accepts any implementation, including fakes.",
      },
    ],
  },

  asyncio: {
    solution: {
      notes: [
        "All ten requests start together inside a `TaskGroup`, but the `Semaphore(3)` lets only three run at a time. The sequential version awaits each request before starting the next, so it takes roughly ten times as long as one request.",
      ],
      code: [
        {
          filename: "Terminal",
          lang: "bash",
          source: `
pip install httpx
`,
        },
        {
          filename: "users_async.py",
          lang: "python",
          source: `
import asyncio
import time

import httpx

BASE_URL = "https://jsonplaceholder.typicode.com"


async def fetch_user(client: httpx.AsyncClient, user_id: int, limit: asyncio.Semaphore) -> str:
    async with limit:
        response = await client.get(f"{BASE_URL}/users/{user_id}", timeout=5)
        response.raise_for_status()
        return response.json()["name"]


async def concurrent() -> list[str]:
    limit = asyncio.Semaphore(3)
    async with httpx.AsyncClient() as client, asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(fetch_user(client, i, limit)) for i in range(1, 11)]
    return [t.result() for t in tasks]


async def sequential() -> list[str]:
    limit = asyncio.Semaphore(1)
    async with httpx.AsyncClient() as client:
        return [await fetch_user(client, i, limit) for i in range(1, 11)]


async def main() -> None:
    for label, run in [("sequential", sequential), ("concurrent (3 at a time)", concurrent)]:
        start = time.perf_counter()
        names = await run()
        print(f"{label:<26} {time.perf_counter() - start:.2f}s  {names[:3]}...")


asyncio.run(main())
`,
        },
      ],
    },
    quiz: [
      {
        question: "What kind of work does asyncio speed up most?",
        options: [
          "CPU-heavy calculations",
          "I/O-bound work such as many network requests",
          "Sorting large lists",
          "Image processing",
        ],
        answer: 1,
        explanation: "While one task waits for I/O, others can run on the same thread.",
      },
      {
        question: "What happens if you call `time.sleep(2)` inside an async function?",
        options: [
          "Only that task pauses",
          "It becomes asynchronous automatically",
          "It raises an error",
          "The whole event loop blocks — no other task can run for 2 seconds",
        ],
        answer: 3,
        explanation: "Use `await asyncio.sleep(2)` (or `asyncio.to_thread` for blocking calls).",
      },
      {
        question: "What does `asyncio.Semaphore(10)` let you do?",
        options: [
          "Limit how many tasks run a section at the same time",
          "Run exactly 10 tasks and stop",
          "Retry failed tasks 10 times",
          "Set a 10-second timeout",
        ],
        answer: 0,
        explanation: "It caps concurrency — e.g. to avoid overwhelming an API.",
      },
      {
        question: "What is an advantage of `asyncio.TaskGroup` over `asyncio.gather`?",
        options: [
          "It is faster",
          "It works without `await`",
          "If one task fails, the other tasks are cancelled and the errors are reported together",
          "It limits concurrency automatically",
        ],
        answer: 2,
        explanation: "TaskGroup (Python 3.11+) gives structured concurrency with safe cleanup.",
      },
    ],
  },

  "threads-and-processes": {
    solution: {
      notes: [
        "Hashing reads each file (I/O) and then computes SHA-256 (CPU). `hashlib` releases the GIL while hashing large buffers, so threads already help here; processes also help but pay a start-up and data-transfer cost. For pure-Python CPU work (like the prime counting in the lesson) only processes give a real speed-up.",
      ],
      code: [
        {
          filename: "hash_files.py",
          lang: "python",
          source: `
import hashlib
import os
import time
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor
from pathlib import Path


def sha256_of(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()[:12]


def timed(label: str, fn) -> None:
    start = time.perf_counter()
    results = fn()
    print(f"{label:<12} {time.perf_counter() - start:6.2f}s  first hash {results[0]}")


if __name__ == "__main__":
    folder = Path("files")
    folder.mkdir(exist_ok=True)
    for i in range(8):
        (folder / f"file{i}.bin").write_bytes(os.urandom(20 * 1024 * 1024))   # 8 x 20 MB
    paths = sorted(folder.glob("*.bin"))

    timed("sequential", lambda: [sha256_of(p) for p in paths])
    with ThreadPoolExecutor() as pool:
        timed("threads", lambda: list(pool.map(sha256_of, paths)))
    with ProcessPoolExecutor() as pool:
        timed("processes", lambda: list(pool.map(sha256_of, paths)))
`,
        },
      ],
    },
    quiz: [
      {
        question: "What does the GIL do in standard CPython?",
        options: [
          "Lets only one thread run Python bytecode at a time",
          "Prevents processes from starting",
          "Speeds up all threads",
          "Locks files while they're open",
        ],
        answer: 0,
        explanation: "That's why threads don't speed up pure-Python CPU-bound work.",
      },
      {
        question: "Which executor suits CPU-bound pure-Python work?",
        options: ["`ThreadPoolExecutor`", "A single thread", "`asyncio`", "`ProcessPoolExecutor`"],
        answer: 3,
        explanation: "Each process has its own interpreter and GIL, so they run truly in parallel.",
      },
      {
        question: "Why must process-pool code be under `if __name__ == \"__main__\":`?",
        options: [
          "It makes the code faster",
          "Worker processes import the module; without the guard they would start pools themselves",
          "Threads require it",
          "It's only a style rule",
        ],
        answer: 1,
        explanation: "The guard stops the pool-starting code from running again in each child process.",
      },
      {
        question: "Ten downloads each wait 0.2 s on the network. Roughly how long with a 10-thread pool?",
        options: ["2 seconds", "0.02 seconds", "About 0.2 seconds", "It can't run in threads"],
        answer: 2,
        explanation: "The GIL is released while waiting on I/O, so the waits overlap.",
      },
    ],
  },

  fastapi: {
    solution: {
      notes: [
        "The list endpoint takes an optional `form` query parameter. `PATCH` accepts a `StudentPatch` model where every field is optional; `model_dump(exclude_unset=True)` keeps only the fields the client actually sent, so the rest stay unchanged. `DELETE` returns 204 with no body.",
      ],
      code: [
        {
          filename: "main.py",
          lang: "python",
          source: `
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Response, status
from pydantic import BaseModel, Field

app = FastAPI(title="Results API")


class StudentIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    form: int = Field(ge=1, le=6)
    scores: list[int] = Field(default_factory=list)


class StudentPatch(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=80)
    form: int | None = Field(default=None, ge=1, le=6)
    scores: list[int] | None = None


class StudentOut(StudentIn):
    id: int


class Store:
    def __init__(self) -> None:
        self.students: dict[int, StudentIn] = {}
        self.next_id = 1


store = Store()
StoreDep = Annotated[Store, Depends(lambda: store)]


def get_or_404(db: Store, student_id: int) -> StudentIn:
    student = db.students.get(student_id)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@app.post("/students", status_code=status.HTTP_201_CREATED)
def create_student(body: StudentIn, db: StoreDep) -> StudentOut:
    student_id = db.next_id
    db.students[student_id] = body
    db.next_id += 1
    return StudentOut(id=student_id, **body.model_dump())


@app.get("/students")
def list_students(db: StoreDep, form: int | None = None) -> list[StudentOut]:
    return [
        StudentOut(id=i, **s.model_dump())
        for i, s in db.students.items()
        if form is None or s.form == form
    ]


@app.patch("/students/{student_id}")
def update_student(student_id: int, body: StudentPatch, db: StoreDep) -> StudentOut:
    current = get_or_404(db, student_id)
    updated = current.model_copy(update=body.model_dump(exclude_unset=True))
    db.students[student_id] = updated
    return StudentOut(id=student_id, **updated.model_dump())


@app.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: int, db: StoreDep) -> Response:
    get_or_404(db, student_id)
    del db.students[student_id]
    return Response(status_code=status.HTTP_204_NO_CONTENT)
`,
        },
        {
          filename: "test_main.py",
          lang: "python",
          source: `
from fastapi.testclient import TestClient

from main import app, store

client = TestClient(app)


def setup_function() -> None:
    store.students.clear()
    store.next_id = 1
    client.post("/students", json={"name": "Amina", "form": 4})
    client.post("/students", json={"name": "Juma", "form": 3})


def test_filter_by_form() -> None:
    names = [s["name"] for s in client.get("/students", params={"form": 4}).json()]
    assert names == ["Amina"]


def test_partial_update_keeps_other_fields() -> None:
    res = client.patch("/students/2", json={"form": 4})
    assert res.status_code == 200
    assert res.json() == {"id": 2, "name": "Juma", "form": 4, "scores": []}


def test_update_validation_and_missing() -> None:
    assert client.patch("/students/1", json={"form": 9}).status_code == 422
    assert client.patch("/students/99", json={"form": 4}).status_code == 404


def test_delete() -> None:
    assert client.delete("/students/1").status_code == 204
    assert client.delete("/students/1").status_code == 404
    assert len(client.get("/students").json()) == 1
`,
        },
      ],
    },
    quiz: [
      {
        question: "What status code does FastAPI return when a request body fails Pydantic validation?",
        options: ["400", "500", "422", "404"],
        answer: 2,
        explanation: "422 Unprocessable Entity, with details of which field failed.",
      },
      {
        question: "Why have separate input (`StudentIn`) and output (`StudentOut`) models?",
        options: [
          "So internal or generated fields are controlled explicitly and never leak by accident",
          "FastAPI requires two models per route",
          "It makes requests faster",
          "Output models can't have validation",
        ],
        answer: 0,
        explanation: "Explicit models define exactly what clients send and receive.",
      },
      {
        question: "What does `Depends(get_store)` do in a route parameter?",
        options: [
          "Imports a module",
          "Makes the parameter optional",
          "Validates the request body",
          "Calls `get_store` and injects its result into the route",
        ],
        answer: 3,
        explanation: "Dependencies provide shared resources such as database sessions or the current user.",
      },
      {
        question: "How can you test a FastAPI app without starting a server?",
        options: [
          "You can't",
          "With `fastapi.testclient.TestClient`",
          "With `curl`",
          "By calling `uvicorn.run` in the test",
        ],
        answer: 1,
        explanation: "`TestClient` sends requests straight to the app in memory.",
      },
    ],
  },

  "postgres-with-psycopg": {
    solution: {
      notes: [
        "A `ConnectionPool` is opened once when the app starts (in the `lifespan` handler) and closed on shutdown. Each route borrows a connection with `pool.connection()`, runs parameterised SQL, and returns rows mapped to Pydantic models with `class_row`.",
      ],
      code: [
        {
          filename: "main.py",
          lang: "python",
          source: `
import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from psycopg.rows import class_row
from psycopg_pool import ConnectionPool
from pydantic import BaseModel, Field

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/school")
pool = ConnectionPool(DATABASE_URL, min_size=1, max_size=5, open=False)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    pool.open()
    with pool.connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS api_students (
                id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                name text     NOT NULL,
                form smallint NOT NULL CHECK (form BETWEEN 1 AND 6)
            )
        """)
    yield
    pool.close()


app = FastAPI(lifespan=lifespan)


class StudentIn(BaseModel):
    name: str = Field(min_length=2)
    form: int = Field(ge=1, le=6)


class StudentOut(BaseModel):
    id: int
    name: str
    form: int


@app.post("/students", status_code=status.HTTP_201_CREATED)
def create_student(body: StudentIn) -> StudentOut:
    with pool.connection() as conn, conn.cursor(row_factory=class_row(StudentOut)) as cur:
        cur.execute(
            "INSERT INTO api_students (name, form) VALUES (%s, %s) RETURNING id, name, form",
            (body.name, body.form),
        )
        return cur.fetchone()


@app.get("/students/{student_id}")
def get_student(student_id: int) -> StudentOut:
    with pool.connection() as conn, conn.cursor(row_factory=class_row(StudentOut)) as cur:
        cur.execute("SELECT id, name, form FROM api_students WHERE id = %s", (student_id,))
        student = cur.fetchone()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@app.get("/students")
def list_students(form: int | None = None) -> list[StudentOut]:
    with pool.connection() as conn, conn.cursor(row_factory=class_row(StudentOut)) as cur:
        cur.execute(
            "SELECT id, name, form FROM api_students WHERE %(form)s::int IS NULL OR form = %(form)s ORDER BY id",
            {"form": form},
        )
        return cur.fetchall()
`,
        },
      ],
    },
    quiz: [
      {
        question: "Why must you never build SQL with f-strings, like `f\"... WHERE name = '{name}'\"`?",
        options: [
          "f-strings are slow",
          "It allows SQL injection — user input could change the query itself",
          "PostgreSQL doesn't accept f-strings",
          "It only works for numbers",
        ],
        answer: 1,
        explanation: "Use `%s` parameters: values are sent separately from the SQL text.",
      },
      {
        question: "What does `with conn.transaction():` guarantee?",
        options: [
          "The statements inside all succeed together, or all roll back",
          "The query runs faster",
          "The connection is closed",
          "Only one user can connect",
        ],
        answer: 0,
        explanation: "Transactions make a group of changes all-or-nothing.",
      },
      {
        question: "Why use a connection pool in a web server?",
        options: [
          "Pools encrypt connections",
          "To share one connection between all users at once",
          "Pools are required by FastAPI",
          "Opening a new connection per request is slow; a pool reuses a few open connections",
        ],
        answer: 3,
        explanation: "Connecting is expensive; pools keep connections ready and cap their number.",
      },
      {
        question: "Where should the database connection string be kept?",
        options: [
          "Hard-coded in `main.py`",
          "In a comment",
          "In an environment variable such as `DATABASE_URL`",
          "In the HTML",
        ],
        answer: 2,
        explanation: "It contains a password, and it differs between environments.",
      },
    ],
  },

  "packaging-and-deployment": {
    solution: {
      notes: [
        "Move the code into `src/results_api/`, the tests into `tests/`, and declare everything in `pyproject.toml` (as in the lesson). `pip install -e \".[dev]\"` installs the package in editable mode, so tests import it as `results_api`. Then the three quality gates must all pass before building the Docker image.",
      ],
      code: [
        {
          filename: "src/results_api/grading.py",
          lang: "python",
          source: `
def grade_for(score: int) -> str:
    """Return the NECTA-style grade letter for a score from 0 to 100."""
    if not 0 <= score <= 100:
        raise ValueError("score must be between 0 and 100")
    for minimum, grade in ((75, "A"), (65, "B"), (45, "C"), (30, "D")):
        if score >= minimum:
            return grade
    return "F"
`,
        },
        {
          filename: "tests/test_grading.py",
          lang: "python",
          source: `
import pytest

from results_api.grading import grade_for


@pytest.mark.parametrize(("score", "grade"), [(75, "A"), (74, "B"), (30, "D"), (29, "F")])
def test_grade_for(score: int, grade: str) -> None:
    assert grade_for(score) == grade


def test_rejects_out_of_range() -> None:
    with pytest.raises(ValueError):
        grade_for(101)
`,
        },
        {
          filename: "Terminal",
          lang: "bash",
          source: `
pip install -e ".[dev]"
ruff check . && ruff format --check . && mypy src && pytest -q
# All checks passed! ... Success: no issues found ... 5 passed

docker build -t results-api .
docker run -p 8000:8000 -e DATABASE_URL="postgresql://..." results-api
`,
        },
      ],
    },
    quiz: [
      {
        question: "What belongs in `pyproject.toml`?",
        options: [
          "Only the Python version",
          "Your application's secrets",
          "Project metadata, dependencies and tool settings (ruff, mypy, pytest)",
          "The source code",
        ],
        answer: 2,
        explanation: "One file describes the project and configures its tools.",
      },
      {
        question: "What does `pip install -e .` do?",
        options: [
          "Installs your package in editable mode, so code changes take effect without reinstalling",
          "Encrypts the package",
          "Installs only the tests",
          "Uploads the package to PyPI",
        ],
        answer: 0,
        explanation: "Editable installs link to your source folder — ideal during development.",
      },
      {
        question: "Which tool lints and formats Python code very quickly?",
        options: ["mypy", "pytest", "pip", "ruff"],
        answer: 3,
        explanation: "ruff covers linting and formatting; mypy checks types; pytest runs tests.",
      },
      {
        question: "Why use the `logging` module instead of `print` in production?",
        options: [
          "`print` doesn't work in Docker",
          "Logs get levels, timestamps and logger names, and can be routed and filtered",
          "`logging` is faster than print for every message",
          "print is deprecated",
        ],
        answer: 1,
        explanation: "Structured, levelled logs are searchable and configurable without code changes.",
      },
    ],
  },
  "command-line-tools": commandLineToolsPractice,
  "project-results-analysis": projectResultsAnalysisPractice,
};
