"""Create the database named in DATABASE_URL, apply the schema, and seed it.

Usage (from the repository root):
    python scripts/init_db.py           # create database + tables
    python scripts/init_db.py --seed    # ...and load sample data
"""

import argparse
import os
import sys
from pathlib import Path

import psycopg
from dotenv import load_dotenv
from psycopg import sql
from psycopg.conninfo import conninfo_to_dict, make_conninfo

ROOT = Path(__file__).resolve().parent.parent
DATABASE_DIR = ROOT / "database"


def ensure_database(database_url: str) -> None:
    """Create the target database if it does not exist yet."""
    params = conninfo_to_dict(database_url)
    name = params.get("dbname")
    if not name:
        raise SystemExit("DATABASE_URL must include a database name")

    # CREATE DATABASE cannot run inside a transaction or against itself.
    admin_url = make_conninfo(database_url, dbname="postgres")
    with psycopg.connect(admin_url, autocommit=True) as connection:
        exists = connection.execute(
            "SELECT 1 FROM pg_database WHERE datname = %s", (name,)
        ).fetchone()
        if exists:
            print(f"Database {name!r} already exists")
            return
        connection.execute(
            sql.SQL("CREATE DATABASE {}").format(sql.Identifier(str(name)))
        )
        print(f"Created database {name!r}")


def run_sql_file(database_url: str, path: Path) -> None:
    with psycopg.connect(database_url) as connection:
        connection.execute(path.read_text(encoding="utf-8").encode())
    print(f"Applied {path.relative_to(ROOT)}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--seed", action="store_true", help="load database/seed.sql"
    )
    args = parser.parse_args()

    load_dotenv(ROOT / ".env")
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        sys.exit("DATABASE_URL is not configured (see .env.example)")

    ensure_database(database_url)
    run_sql_file(database_url, DATABASE_DIR / "schema.sql")
    if args.seed:
        run_sql_file(database_url, DATABASE_DIR / "seed.sql")


if __name__ == "__main__":
    main()
