'use strict';

var Point = function(x, y) {
    this.x = x;
    this.y = y;

    return this;
};

var Pair = function(a, b) {
    this.a = a;
    this.b = b;
};

Pair.prototype.sdistance = function() {
    var dx = this.b.x - this.a.x, dy = this.b.y - this.a.y;
    return dx * dx + dy * dy;
}

Pair.prototype.distance = function() {
    return Math.sqrt(this.sdistance());
}

var ClosestPairFinder = function(points) {
    /** @var Point[] sortedPointsByX - points sorted x coordinate */
    this.sortedPointsByX = this.sortPointsBy(points.slice(0), 'x');

    /** @var Point[] sortedPointsByY - points sorted y coordinate */
    this.sortedPointsByY = this.sortPointsBy(points.slice(0), 'y');
};

ClosestPairFinder.prototype.sortPointsBy = function(points, by) {
    return points.sort(function(a, b) {
        return a[by] - b[by];
    });
};

ClosestPairFinder.prototype.points = function() {
    return this.sortedPointsByX;
};

ClosestPairFinder.prototype.splitByXInHalf = function() {
    var n = this.points().length, l = Math.floor(n * 0.5), x = this.sortedPointsByX[l - 1].x;

    var lSubset = new ClosestPairFinder([]);
    lSubset.sortedPointsByX = this.sortedPointsByX.filter(function(point) {
        return point.x <= x;
    });
    lSubset.sortedPointsByY = this.sortedPointsByY.filter(function(point) {
        return point.x <= x;
    });

    var rSubset = new ClosestPairFinder([]);
    rSubset.sortedPointsByX = this.sortedPointsByX.filter(function(point) {
        return point.x > x;
    });
    rSubset.sortedPointsByY = this.sortedPointsByY.filter(function(point) {
        return point.x > x;
    });

    return [lSubset, rSubset];
};

ClosestPairFinder.prototype.removeFurtherThanX = function(x, d) {
    var closer = new ClosestPairFinder([]);

    closer.sortedPointsByX = this.sortedPointsByX.filter(function(point) {
        return new Pair(new Point(x, point.y), point).sdistance() < d;
    });
    closer.sortedPointsByY = this.sortedPointsByY.filter(function(point) {
        return new Pair(new Point(x, point.y), point).sdistance() < d;
    });

    return closer;
};

ClosestPairFinder.prototype.findClosestPair = function() {
    if (this.points().length < 2) return new Pair(new Point(0, 0), new Point(Infinity, 0));
    if (this.points().length == 2) return new Pair(this.points()[0], this.points()[1]);

    var halfs = this.splitByXInHalf();
    var l = halfs[0].sortedPointsByX[(halfs[0].sortedPointsByX).length - 1].x;
    var pairs = halfs.map(function (half) {
        return half.findClosestPair();
    });
    var pair = pairs[0].sdistance() < pairs[1].sdistance() ? pairs[0] : pairs[1];
    var d = pair.sdistance();

    var closer = this.removeFurtherThanX(l, d).sortedPointsByY;
    for (var i = 0; i < closer.length; i++) {
        for (var j = 1; j < Math.min(8, closer.length - i); j++) {
            var p = new Pair(closer[i], closer[i+j]);
            if (p.sdistance() < d) {
                pair = p;
                d = p.sdistance();
            }
        }
    }

    return pair;
};


///////////////////////////////////

var points = [
    new Point(0, 0),
    new Point(10, 0),
    new Point(10, 10),
    new Point(0, 10),
    new Point(12, 12),
];

var finder = new ClosestPairFinder(points);

console.log(finder.findClosestPair());
