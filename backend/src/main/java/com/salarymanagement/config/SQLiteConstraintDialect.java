package com.salarymanagement.config;

import org.hibernate.community.dialect.SQLiteDialect;
import org.hibernate.exception.ConstraintViolationException;
import org.hibernate.exception.spi.SQLExceptionConversionDelegate;

/**
 * The community SQLite dialect reports constraint failures as generic JDBC errors.
 * Mapping them to ConstraintViolationException lets Spring translate them to
 * DataIntegrityViolationException (e.g. duplicate email).
 */
public class SQLiteConstraintDialect extends SQLiteDialect {

    private static final int SQLITE_CONSTRAINT = 19;

    @Override
    public SQLExceptionConversionDelegate buildSQLExceptionConversionDelegate() {
        SQLExceptionConversionDelegate base = super.buildSQLExceptionConversionDelegate();
        return (sqlException, message, sql) -> {
            // sqlite-jdbc returns extended result codes; the primary code is the low byte.
            if ((sqlException.getErrorCode() & 0xFF) == SQLITE_CONSTRAINT) {
                return new ConstraintViolationException(message, sqlException, sql, null);
            }
            return base == null ? null : base.convert(sqlException, message, sql);
        };
    }
}
