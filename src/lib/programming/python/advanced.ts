import type { LevelTrack } from "../types";
import { commandLineTools, projectResultsAnalysis } from "./more";

export const advanced: LevelTrack = {
  intro:
    "Go deep: decorators and context managers, advanced typing, concurrency with asyncio, threads and processes, building validated REST APIs with FastAPI, talking to PostgreSQL, and packaging and deploying Python services.",
  outcomes: [
    "Write decorators, context managers and Protocol-based interfaces",
    "Choose between asyncio, threads and processes for concurrent work",
    "Build a validated REST API with FastAPI and Pydantic",
    "Use PostgreSQL safely from Python and ship a production-ready project",
  ],
  lessons: [
    {
      slug: "decorators-and-context-managers",
      title: "Decorators & Context Managers",
      summary: "Wrap functions with reusable behaviour and manage resources with `with`.",
      body: [
        "Functions in Python are objects: you can pass them around and return them. A decorator is a function that takes a function and returns an improved version — adding timing, logging, caching, retries or permission checks without touching the original code. Always use `functools.wraps` so the wrapped function keeps its name and docstring.",
        "Decorators can take arguments too (like `@retry(times=3)`); that just adds one more layer of function.",
        "A context manager sets something up and guarantees cleanup — files, locks, database transactions, timers. Write one quickly with `@contextmanager` and a single `yield`, placing cleanup in `finally`.",
      ],
      code: [
        {
          filename: "decorators.py",
          lang: "python",
          source: `
import time
from collections.abc import Callable, Iterator
from contextlib import contextmanager
from functools import lru_cache, wraps
from typing import ParamSpec, TypeVar

P = ParamSpec("P")
R = TypeVar("R")


def timed(func: Callable[P, R]) -> Callable[P, R]:
    @wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        start = time.perf_counter()
        try:
            return func(*args, **kwargs)
        finally:
            print(f"{func.__name__} took {(time.perf_counter() - start) * 1000:.1f} ms")
    return wrapper


def retry(times: int) -> Callable[[Callable[P, R]], Callable[P, R]]:
    def decorator(func: Callable[P, R]) -> Callable[P, R]:
        @wraps(func)
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except ConnectionError:
                    if attempt == times:
                        raise
                    print(f"attempt {attempt} failed, retrying")
            raise AssertionError("unreachable")
        return wrapper
    return decorator


@contextmanager
def section(title: str) -> Iterator[None]:
    print(f"--- {title} ---")
    try:
        yield
    finally:
        print(f"--- end {title} ---")


@lru_cache(maxsize=None)
def fib(n: int) -> int:
    return n if n < 2 else fib(n - 1) + fib(n - 2)


calls = {"n": 0}


@retry(times=3)
def flaky() -> str:
    calls["n"] += 1
    if calls["n"] < 3:
        raise ConnectionError("network down")
    return "ok"


@timed
def slow_sum(n: int) -> int:
    return sum(range(n))


with section("demo"):
    print(slow_sum(1_000_000))
    print(fib(80))          # instant thanks to lru_cache
    print(flaky())
`,
        },
      ],
      keyPoints: [
        "A decorator = a function that wraps another function; use `functools.wraps`.",
        "`functools.lru_cache` is a ready-made memoisation decorator.",
        "`@contextmanager` + `try/finally` guarantees cleanup.",
      ],
      exercise:
        "Write a `@require_role(\"admin\")` decorator that checks a `user` dict's role before calling the function and raises `PermissionError` otherwise. Then write a `timer()` context manager that prints how long its block took.",
    },
    {
      slug: "advanced-typing",
      title: "Advanced Typing: Generics & Protocols",
      summary: "Generic functions and classes, Protocols for duck typing, and overloads.",
      body: [
        "Generics let a function or class work with any type while keeping type information: a `Stack[int]` only accepts ints, and `first(items)` returns the same type the list holds.",
        "A `Protocol` describes the methods an object must have — any class with matching methods fits, without inheriting from anything. This is structural typing (\"duck typing\" that the type checker understands), and it's the cleanest way to define interfaces for things like repositories or notifiers.",
        "`@overload` describes functions whose return type depends on the arguments. Python 3.12 adds shorter syntax (`def first[T](items: list[T]) -> T`), but the `TypeVar` form below works on every modern version.",
      ],
      code: [
        {
          filename: "typing_advanced.py",
          lang: "python",
          source: `
from dataclasses import dataclass
from typing import Generic, Protocol, TypeVar, overload

T = TypeVar("T")


class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        if not self._items:
            raise IndexError("pop from empty stack")
        return self._items.pop()


def first(items: list[T]) -> T | None:
    return items[0] if items else None


class Notifier(Protocol):
    def send(self, to: str, message: str) -> None: ...


class SmsNotifier:                      # no inheritance needed
    def send(self, to: str, message: str) -> None:
        print(f"SMS to {to}: {message}")


@dataclass
class ResultService:
    notifier: Notifier

    def publish(self, phone: str, average: float) -> None:
        self.notifier.send(phone, f"Your average is {average:.1f}")


@overload
def to_score(value: str) -> int: ...
@overload
def to_score(value: list[str]) -> list[int]: ...
def to_score(value: str | list[str]) -> int | list[int]:
    if isinstance(value, list):
        return [int(v) for v in value]
    return int(value)


stack: Stack[int] = Stack()
stack.push(1)
stack.push(2)
print(stack.pop(), first(["a", "b"]))

ResultService(SmsNotifier()).publish("0712345678", 78.456)
print(to_score("88") + 1, to_score(["1", "2"]))
`,
        },
      ],
      keyPoints: [
        "Generics keep types precise for containers and helpers.",
        "Protocols define interfaces by shape — great for swapping implementations in tests.",
        "`@overload` documents functions whose return type depends on input.",
      ],
      exercise:
        "Define a `Repository[T]` Protocol with `get(id)`, `add(item)` and `all()`. Implement an `InMemoryRepository` for a `Student` dataclass and write a function that accepts any `Repository[Student]`.",
    },
    {
      slug: "asyncio",
      title: "Async Programming with asyncio",
      summary: "Run many I/O-bound tasks concurrently with async / await.",
      body: [
        "Most programs spend time waiting — for the network, a database, a disk. `asyncio` lets one thread juggle thousands of waiting tasks: while one task awaits a response, others run.",
        "Define coroutines with `async def`, pause them with `await`, and start the event loop with `asyncio.run(main())`. Run tasks concurrently with `asyncio.gather` or, better, `asyncio.TaskGroup` (Python 3.11+), which cancels the other tasks if one fails.",
        "Limit concurrency with `asyncio.Semaphore` (so you don't hit an API with 1,000 requests at once) and bound waiting with `asyncio.timeout`. Never call blocking functions like `time.sleep` or `requests.get` inside async code — use async libraries (such as httpx) or `asyncio.to_thread`.",
      ],
      code: [
        {
          filename: "async_demo.py",
          lang: "python",
          source: `
import asyncio
import random
import time


async def fetch_result(student_id: int, limit: asyncio.Semaphore) -> tuple[int, int]:
    async with limit:                              # at most N at a time
        await asyncio.sleep(random.uniform(0.1, 0.3))   # pretend network call
        return student_id, random.randint(20, 100)


async def main() -> None:
    limit = asyncio.Semaphore(10)
    start = time.perf_counter()

    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(fetch_result(i, limit)) for i in range(50)]

    results = [t.result() for t in tasks]
    print(f"{len(results)} results in {time.perf_counter() - start:.2f}s")  # ~1s, not ~10s

    try:
        async with asyncio.timeout(0.05):
            await asyncio.sleep(1)
    except TimeoutError:
        print("timed out as expected")

    checksum = await asyncio.to_thread(sum, range(10_000_000))  # blocking work off the loop
    print(checksum)


asyncio.run(main())
`,
        },
      ],
      keyPoints: [
        "asyncio shines for I/O-bound work: many requests, sockets, DB calls.",
        "Prefer `TaskGroup`; limit concurrency with a `Semaphore`.",
        "Never block the event loop — use async libraries or `asyncio.to_thread`.",
      ],
      exercise:
        "Install `httpx` and fetch users 1–10 from `https://jsonplaceholder.typicode.com/users/{id}` concurrently with `httpx.AsyncClient` and a TaskGroup, limited to 3 at a time. Compare the time against fetching them one by one.",
    },
    {
      slug: "threads-and-processes",
      title: "Threads, Processes & the GIL",
      summary: "Use concurrent.futures to speed up I/O-bound and CPU-bound work.",
      body: [
        "In the standard CPython interpreter, the Global Interpreter Lock (GIL) lets only one thread run Python code at a time. Threads still help for I/O-bound work (downloads, file and database access) because the GIL is released while waiting.",
        "For CPU-bound work (number crunching, image processing, parsing big files) use multiple processes: each has its own interpreter and GIL, so they truly run in parallel on multiple cores.",
        "`concurrent.futures` gives one simple API for both: `ThreadPoolExecutor` and `ProcessPoolExecutor`. Code that starts processes must sit under `if __name__ == \"__main__\":`.",
      ],
      code: [
        {
          filename: "pools.py",
          lang: "python",
          source: `
import time
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor


def count_primes(limit: int) -> int:
    count = 0
    for n in range(2, limit):
        if all(n % d for d in range(2, int(n ** 0.5) + 1)):
            count += 1
    return count


def fake_download(i: int) -> int:
    time.sleep(0.2)          # I/O wait: the GIL is released
    return i


def timed(label: str, fn) -> None:
    start = time.perf_counter()
    result = fn()
    print(f"{label:<22}{time.perf_counter() - start:6.2f}s  {result}")


if __name__ == "__main__":
    jobs = [150_000] * 4

    timed("CPU, sequential", lambda: [count_primes(n) for n in jobs])
    with ProcessPoolExecutor() as pool:
        timed("CPU, processes", lambda: list(pool.map(count_primes, jobs)))

    timed("I/O, sequential", lambda: len([fake_download(i) for i in range(10)]))
    with ThreadPoolExecutor(max_workers=10) as pool:
        timed("I/O, threads", lambda: len(list(pool.map(fake_download, range(10)))))
`,
        },
      ],
      keyPoints: [
        "I/O-bound → threads or asyncio. CPU-bound → processes.",
        "`concurrent.futures` offers the same API for thread and process pools.",
        "Guard process-pool code with `if __name__ == \"__main__\":`.",
      ],
      exercise:
        "Write a script that resizes or hashes (with `hashlib.sha256`) every file in a folder. Time it sequentially, with a thread pool and with a process pool, and explain the results.",
    },
    {
      slug: "fastapi",
      title: "Building REST APIs with FastAPI",
      summary: "Typed routes, automatic validation with Pydantic, dependencies and interactive docs.",
      body: [
        "FastAPI builds web APIs from ordinary typed Python functions. It validates requests using your type hints and Pydantic models, returns clear 422 errors for bad input, and generates interactive documentation at `/docs` automatically.",
        "Pydantic models define the shape and rules of your data (`Field(min_length=2)`, `EmailStr`, ranges). Use separate models for input (`StudentIn`) and output (`StudentOut`) so internal fields never leak.",
        "Dependencies (`Depends`) inject shared things — a database session, the current user — into routes. Raise `HTTPException` for errors like 404. FastAPI's `TestClient` lets you test the API without starting a server.",
      ],
      code: [
        {
          filename: "Terminal",
          lang: "bash",
          source: `
pip install "fastapi[standard]"
fastapi dev main.py            # then open http://127.0.0.1:8000/docs
`,
        },
        {
          filename: "main.py",
          lang: "python",
          source: `
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, status
from pydantic import BaseModel, Field

app = FastAPI(title="Results API")


class StudentIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    form: int = Field(ge=1, le=6)
    scores: list[int] = Field(default_factory=list)


class StudentOut(StudentIn):
    id: int
    average: float


class Store:
    def __init__(self) -> None:
        self.students: dict[int, StudentIn] = {}
        self.next_id = 1


store = Store()


def get_store() -> Store:
    return store


StoreDep = Annotated[Store, Depends(get_store)]


def to_out(student_id: int, s: StudentIn) -> StudentOut:
    avg = sum(s.scores) / len(s.scores) if s.scores else 0.0
    return StudentOut(id=student_id, average=round(avg, 1), **s.model_dump())


@app.post("/students", status_code=status.HTTP_201_CREATED)
def create_student(body: StudentIn, db: StoreDep) -> StudentOut:
    student_id = db.next_id
    db.students[student_id] = body
    db.next_id += 1
    return to_out(student_id, body)


@app.get("/students/{student_id}")
def get_student(student_id: int, db: StoreDep) -> StudentOut:
    student = db.students.get(student_id)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return to_out(student_id, student)
`,
        },
        {
          filename: "test_main.py",
          lang: "python",
          source: `
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_create_and_get() -> None:
    res = client.post("/students", json={"name": "Amina", "form": 4, "scores": [80, 90]})
    assert res.status_code == 201
    assert res.json()["average"] == 85.0
    assert client.get(f"/students/{res.json()['id']}").status_code == 200


def test_validation_and_404() -> None:
    assert client.post("/students", json={"name": "A", "form": 9}).status_code == 422
    assert client.get("/students/999").status_code == 404
`,
        },
      ],
      keyPoints: [
        "Type hints + Pydantic = automatic validation and docs.",
        "Separate input and output models; never return internal fields by accident.",
        "Use `Depends` for shared resources and `TestClient` for fast API tests.",
      ],
      exercise:
        "Add `GET /students?form=4` (filter with a query parameter), `PATCH /students/{id}` that accepts a partial update, and `DELETE /students/{id}`. Write tests for each, including the error cases.",
    },
    {
      slug: "postgres-with-psycopg",
      title: "Working with PostgreSQL from Python",
      summary: "Connect with psycopg 3, run parameterised queries, use transactions and pools.",
      body: [
        "psycopg is the standard PostgreSQL driver for Python. Connect with a connection string (keep it in the `DATABASE_URL` environment variable) and run SQL with `conn.execute`.",
        "Always pass values as parameters (`%s` placeholders plus a tuple) — never build SQL with f-strings. Parameters are sent separately from the SQL, which completely prevents SQL injection.",
        "`with conn.transaction():` groups statements so they all succeed or all roll back. In web apps, use a connection pool (`psycopg_pool`) instead of opening a new connection for every request. See the PostgreSQL track on this site to learn the SQL itself.",
      ],
      code: [
        {
          filename: "Terminal",
          lang: "bash",
          source: `
pip install "psycopg[binary]" psycopg_pool
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/school"
`,
        },
        {
          filename: "db.py",
          lang: "python",
          source: `
import os
from dataclasses import dataclass

import psycopg
from psycopg.rows import class_row

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/school")


@dataclass
class Result:
    name: str
    subject: str
    score: int


def main() -> None:
    with psycopg.connect(DATABASE_URL) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS py_results (
                id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                name    text NOT NULL,
                subject text NOT NULL,
                score   int  NOT NULL CHECK (score BETWEEN 0 AND 100)
            )
        """)
        conn.execute("TRUNCATE py_results")

        rows = [("Amina", "Maths", 88), ("Juma", "Maths", 42), ("Neema", "Biology", 71)]
        with conn.transaction():                     # all-or-nothing
            with conn.cursor() as cur:
                cur.executemany(
                    "INSERT INTO py_results (name, subject, score) VALUES (%s, %s, %s)", rows
                )

        name = "Amina'; DROP TABLE py_results; --"   # malicious input is harmless as a parameter
        print(conn.execute("SELECT count(*) FROM py_results WHERE name = %s", (name,)).fetchone())

        with conn.cursor(row_factory=class_row(Result)) as cur:
            cur.execute(
                "SELECT name, subject, score FROM py_results WHERE score >= %s ORDER BY score DESC",
                (45,),
            )
            for r in cur.fetchall():
                print(r)

        try:
            with conn.transaction():
                conn.execute("INSERT INTO py_results (name, subject, score) VALUES ('Ali', 'Maths', 50)")
                conn.execute("INSERT INTO py_results (name, subject, score) VALUES ('Bad', 'Maths', 150)")
        except psycopg.errors.CheckViolation:
            print("rolled back; Ali was not saved either")

        print(conn.execute("SELECT count(*) FROM py_results").fetchone())   # (3,)


if __name__ == "__main__":
    main()
`,
        },
      ],
      keyPoints: [
        "Never format SQL with f-strings — always use `%s` parameters.",
        "`conn.transaction()` makes a group of statements all-or-nothing.",
        "Use a connection pool in servers; keep the connection string in an environment variable.",
      ],
      exercise:
        "Connect the FastAPI app from the previous lesson to PostgreSQL: create a `students` table, use a `psycopg_pool.ConnectionPool` opened at startup, and replace the in-memory store with SQL queries.",
    },
    commandLineTools,
    {
      slug: "packaging-and-deployment",
      title: "Project Structure, Quality Tools & Deployment",
      summary: "pyproject.toml, src layout, ruff, logging, configuration and Docker.",
      body: [
        "A modern Python project keeps its code under `src/<package>/`, tests under `tests/`, and all metadata, dependencies and tool settings in one `pyproject.toml`. Tools like uv or pip install from it; `pip install -e .` installs your package in editable mode during development.",
        "Automate quality: ruff (linting and formatting — very fast), mypy (types) and pytest (tests). Run them locally and in CI on every push.",
        "In production use the `logging` module (not print), read configuration from environment variables, run the API with a production server (FastAPI uses Uvicorn), and package everything in a small Docker image that runs as a non-root user.",
      ],
      code: [
        {
          filename: "Project layout",
          lang: "text",
          source: `
results-api/
├── pyproject.toml
├── Dockerfile
├── src/
│   └── results_api/
│       ├── __init__.py
│       ├── main.py
│       └── db.py
└── tests/
    └── test_main.py
`,
        },
        {
          filename: "pyproject.toml",
          lang: "toml",
          source: `
[project]
name = "results-api"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
  "fastapi[standard]>=0.115",
  "psycopg[binary,pool]>=3.2",
]

[project.optional-dependencies]
dev = ["pytest>=8", "mypy>=1.11", "ruff>=0.6"]

[tool.ruff]
line-length = 100

[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP"]

[tool.mypy]
strict = true

[tool.pytest.ini_options]
testpaths = ["tests"]
`,
        },
        {
          filename: "src/results_api/logging_setup.py",
          lang: "python",
          source: `
import logging
import os


def configure_logging() -> logging.Logger:
    logging.basicConfig(
        level=os.environ.get("LOG_LEVEL", "INFO"),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    return logging.getLogger("results_api")


log = configure_logging()
log.info("service starting", extra={"port": os.environ.get("PORT", "8000")})
`,
        },
        {
          filename: "Dockerfile",
          lang: "dockerfile",
          source: `
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY pyproject.toml ./
COPY src ./src
RUN pip install --no-cache-dir .
USER nobody
EXPOSE 8000
CMD ["uvicorn", "results_api.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
`,
        },
        {
          filename: "Terminal",
          lang: "bash",
          source: `
pip install -e ".[dev]"
ruff check . && ruff format --check . && mypy src && pytest
docker build -t results-api . && docker run -p 8000:8000 -e DATABASE_URL=... results-api
`,
        },
      ],
      keyPoints: [
        "One `pyproject.toml` holds dependencies and tool settings; use the src layout.",
        "ruff + mypy + pytest on every push keeps quality high.",
        "Log with `logging`, configure with env vars, run as non-root in Docker.",
      ],
      exercise:
        "Restructure your FastAPI + PostgreSQL project into the layout above, add the quality tools, make `ruff`, `mypy` and `pytest` pass, then build and run the Docker image locally.",
    },
    projectResultsAnalysis,
  ],
};
