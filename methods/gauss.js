// Originally from: https://github.com/dmaevsky/gauss-legendre
// License: MIT

// Given the lower and upper limits of integration x1 and x2, this routine returns arrays x[0..n-1]
// and w[0..n-1] of length n, containing the abscissas and weights of the Gauss-Legendre n-point
// quadrature formula.

const cache = new Map();
const scale = (abscissas, x1, x2) => {
    const factor = (x2 - x1) / 2;
    return {
        x: abscissas.x.map(x => x * factor + (x2 + x1) / 2),
        w: abscissas.w.map(w => w * factor)
    }
}
export default function computeGaussAbscissas(n, x1 = -1., x2 = 1.) {
    if (cache.has(n)) return scale(cache.get(n), x1, x2);

    const EPS = 1.0e-14; // EPS is the relative precision
    const x = new Array(n);
    const w = new Array(n);

    let z1, z, pp, p3, p2, p1;
    const m = (n + 1) >> 1; // The roots are symmetric in the interval, so we only have to find half of them

    for (let i = 0; i < m; i++) {
        z = Math.cos(3.141592654 * (i + 0.75) / (n + 0.5));
        // Starting with this approximation to the ith root, we enter the main loop of refinement by Newton’s method
        do {
            p1=1.0;
            p2=0.0;
            for (let j=0;j<n;j++) { //Loop up the recurrence relation to get the Legendre polynomial evaluated at z.
                p3=p2;
                p2=p1;
                p1=((2.0*j+1.0)*z*p2-j*p3)/(j+1);
            }
            // p1 is now the desired Legendre polynomial. We next compute pp, its derivative,
            // by a standard relation involving also p2, the polynomial of one lower order.
            pp=n*(z*p1-p2)/(z*z-1.0);
            z1=z;
            z=z1-p1/pp; //Newton’s method
        } while (Math.abs(z-z1) > EPS);

        x[i]=-z; // Input the root
        x[n-1-i]=z; // and put in its symmetric counterpart.
        w[i]=2.0/((1.0-z*z)*pp*pp); // Compute the weight
        w[n-1-i]=w[i]; // and its symmetric counterpart.
    }

    cache.set(n, { x, w });
    return scale({ x, w }, x1, x2);
}