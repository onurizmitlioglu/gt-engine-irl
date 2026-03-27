"""add story_summary and update_history to sessions

Revision ID: 4c5152e5b729
Revises: a0b99eadd162
Create Date: 2026-03-20 23:55:55.085132

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4c5152e5b729'
down_revision: Union[str, Sequence[str], None] = 'a0b99eadd162'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('sessions', sa.Column('story_summary', sa.Text(), nullable=True))
    op.add_column('sessions', sa.Column('update_history', sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column('sessions', 'update_history')
    op.drop_column('sessions', 'story_summary')