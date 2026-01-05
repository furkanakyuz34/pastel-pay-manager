namespace EgemenLisansYonetimiBackend.Api.Common;

public sealed class ApiResponse<T>
{
    public bool Success { get; init; }
    public T? Data { get; init; }
    public string? Message { get; init; }
    public ApiError? Error { get; init; }
    public string? TraceId { get; init; }

    public static ApiResponse<T> Ok(T data, string? message = null, string? traceId = null)
        => new() { Success = true, Data = data, Message = message, TraceId = traceId };

    public static ApiResponse<T> Fail(string code, string? detail, string? message = null, string? traceId = null)
        => new()
        {
            Success = false,
            Data = default,
            Message = message,
            Error = new ApiError { Code = code, Detail = detail },
            TraceId = traceId
        };
}
