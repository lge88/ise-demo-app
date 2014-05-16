function pb2
syms T1 T2 T3 uA vA real;
syms E A L P real;

[T1, T2, T3, uA, vA] = solve(...
    -T1 - T2 * (1/2) + T3 * (1/2) + P == 0, ...
    T2 * sqrt(3) / 2 + T3 * sqrt(3) / 2 == 0, ...
    T1 == E * A * uA / L, ...
    T2 == E * A * (uA * (1/2) - vA * sqrt(3) / 2)/L, ...
    T3 == E * 2 * A * (-uA * (1/2) - vA * sqrt(3) / 2)/L, ...
    T1, T2, T3, uA, vA);  %#ok<*NODEF>

f1 = matlabFunction(T1, 'vars', [E, A, L, P]);
f2 = matlabFunction(T2, 'vars', [E, A, L, P]);
f3 = matlabFunction(T3, 'vars', [E, A, L, P]);
f4 = matlabFunction(uA, 'vars', [E, A, L, P]);
f5 = matlabFunction(vA, 'vars', [E, A, L, P]);

E = 200e9;
A = 2e-4;
L = 0.25;
P = 50e3;

fprintf('T1 (kN) = %s = %f\n', char(simplify(T1)), 1e-3 * f1(E, A, L, P));
fprintf('T2 (kN) = %s = %f\n', char(simplify(T2)), 1e-3 * f2(E, A, L, P));
fprintf('T3 (kN) = %s = %f\n', char(simplify(T3)), 1e-3 * f3(E, A, L, P));
fprintf('uA (cm) = %s = %f\n', char(simplify(uA)), 100 * f4(E, A, L, P));
fprintf('vA (cm) = %s = %f\n', char(simplify(vA)), 100 * f5(E, A, L, P));
end