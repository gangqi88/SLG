/**
 * 首屏体积预算：配置 + 纯判定逻辑（无 IO，可直接被自验脚本喂合成数据）
 *
 * 三个退出码（CI 只看这个）：
 *   0 = 通过
 *   1 = 超出预算（或 favicon 断言失败）—— **代码问题**
 *   2 = 无法判定（无运行时数据 / 环境缺失 / 口径不自洽）—— **不是代码问题**
 *
 * 为什么必须区分 1 和 2：
 *   "超了 100 字节" 和 "没测到任何东西" 如果都返回非 0，CI 只会告诉你"红了"，
 *   而这两种红要做的动作完全相反（一个去减体积，一个去修环境）。
 */

export const EXIT = /** @type {const} */ ({ PASS: 0, OVER: 1, UNDECIDABLE: 2 });

/**
 * 预算配置。
 *
 * 不变量（每次运行都校验，对不上直接 exit 2）：
 *   thresholdBytes === baselineBytes + Σ allowed[].deltaBytes
 *
 * 这条不变量的作用：把"余量"从隐含变成账目。
 * 如果没有它，112640 相对 111779 多出来的 861 B 就是一截没人解释的空隙；
 * 有了它，861 B 必须是一条带日期/理由/批准人的记录。
 */
export const BUDGET = {
  /**
   * 门禁被测路径：钉死 '/'。
   *
   * 换个路径量的就是另一个东西 —— 实测同一份构建：
   *   /         首屏 111,779 B
   *   /reports  首屏 113,556 B  ← 已超阈值 916 B
   * 也就是说：谁把门禁指向 /reports，它今天就是红的，**而这个红是路由重量，不是首屏回归**。
   * 要测别的路径，另立脚本，不共用这个门禁。
   */
  path: '/',
  /**
   * 当前实测基线（AC-09-1，runtime 口径，4 次逐字节一致）。
   *
   * ⚠️ 历史口径已作废：`109,794 B`（静态枚举、round-1 构建）**不得作为任何阈值依据**。
   * 它与当前口径差 1,958 B（启动期 chunk）；另有 27 B 是同口径在两次构建之间的漂移，
   * **逐项归属未知（round-1 未存逐项记录）**。两者不可相加 —— 前者是口径差异，后者是源码变化。
   */
  baselineBytes: 111_779,
  /**
   * 阶段一冻结线 = 基线 + 显式放宽（见 allowed 账本）。
   *
   * ⚠️ **阶段二尚未推导。** 原值 102,400 来自 round-1 的 C1+C2 实测，
   * **而 C2 已撤回**（收益 0.40 KiB、动的是 0 覆盖模块，当时判"倒贴"）——
   * 该推导前提不存在，所以它不是目标，是愿望。
   * 需要时先做瘦身批次的 **runtime 实测**，再按实测定值。**不要直接把任何历史数字填进来。**
   *
   * 另一条同样会被踩的推论：阶段二也不能靠"多拆几个路由"凑到 ——
   * 拆出去的是别的路由的重量（`/reports` 当日 3,735 B 属于它自己，不属于 `/`）。
   * 首页要降，只能减**首页自己**拉的东西。
   */
  thresholdBytes: 112_640,
  /** 显式放宽账本。任何上升都必须在这里留一条记录。 */
  allowed: [
    {
      date: '2026-10-20',
      deltaBytes: 861,
      reason:
        '阶段一冻结线的显式余量。冻结线若严格等于基线（0 余量），任何一次不减少体积的正常改动都会立刻变红，' +
        '实际后果是"顺手夹带一次优化"或"直接改阈值"，两条路都比留一条带记录的余量差。' +
        '861 B ≈ 0.77%，只够一次小改动；超出必须再记一条。',
      approvedBy: 'team-lead',
    },
  ],
  /** favicon 允许集合：请求集合必须是它的子集。 */
  allowedFavicon: ['/favicon.svg'],
};

export const ledgerSum = (allowed) => allowed.reduce((acc, e) => acc + e.deltaBytes, 0);

/**
 * @param {typeof BUDGET} budget
 * @returns {{ ok: boolean, expected: number, actual: number, sum: number }}
 */
export const checkLedgerInvariant = (budget) => {
  const sum = ledgerSum(budget.allowed);
  const expected = budget.baselineBytes + sum;
  return { ok: expected === budget.thresholdBytes, expected, actual: budget.thresholdBytes, sum };
};

export const formatUnits = (bytes) => ({
  bytes,
  kib: `${(bytes / 1024).toFixed(2)} KiB`,
  kb: `${(bytes / 1000).toFixed(2)} kB`,
});

/**
 * 纯判定。不做 IO、不打日志、不碰进程，方便自验脚本直接喂合成数据。
 *
 * @param {object|null|undefined} measurement
 * @param {typeof BUDGET} [budget]
 * @returns {{ code: number, reasons: string[], warnings: string[] }}
 */
export const evaluate = (measurement, budget = BUDGET) => {
  const reasons = [];
  const warnings = [];

  // —— 能判吗？——
  if (
    !measurement ||
    typeof measurement.runtimeBytes !== 'number' ||
    measurement.assetCount === 0
  ) {
    return {
      code: EXIT.UNDECIDABLE,
      reasons: ['无运行时数据：没有拿到任何 script/stylesheet/font 响应，无法判定体积'],
      warnings,
    };
  }
  if (measurement.finalPath !== budget.path) {
    return {
      code: EXIT.UNDECIDABLE,
      reasons: [
        `被测路径不是首页，本门禁的基线不适用：期望 ${budget.path}，实际 ${measurement.finalPath}`,
        '不同路由的启动期 chunk 完全不同（实测 /reports 比 / 重 1,777 B，已超阈值），' +
          '换了路径就等于换了含义',
      ],
      warnings,
    };
  }
  if (Array.isArray(measurement.declaredButMissing) && measurement.declaredButMissing.length > 0) {
    return {
      code: EXIT.UNDECIDABLE,
      reasons: [
        `index.html 声明了但没请求到的资产：${measurement.declaredButMissing.join(', ')}`,
        '这通常意味着静态清单解析错误或资产 404，测量结果不可信',
      ],
      warnings,
    };
  }

  const identity = measurement.staticBytes + measurement.startupBytes;
  if (identity !== measurement.runtimeBytes) {
    return {
      code: EXIT.UNDECIDABLE,
      reasons: [
        `恒等式不成立：static(${measurement.staticBytes}) + startup(${measurement.startupBytes}) ` +
          `= ${identity} ≠ runtime(${measurement.runtimeBytes})`,
        '三者本应来自同一次测量的切分，不相等说明测量或归类有 bug',
      ],
      warnings,
    };
  }

  const ledger = checkLedgerInvariant(budget);
  if (!ledger.ok) {
    return {
      code: EXIT.UNDECIDABLE,
      reasons: [
        `预算账本不自洽：baseline(${budget.baselineBytes}) + Σallowed(${ledger.sum}) ` +
          `= ${ledger.expected} ≠ threshold(${budget.thresholdBytes})`,
        '任何放宽都必须记账，threshold 只能等于 baseline 与账本之和',
      ],
      warnings,
    };
  }

  // —— 能判，开始判 ——
  const faviconSet = measurement.faviconRequests ?? [];
  const illegalFavicon = faviconSet.filter((u) => !budget.allowedFavicon.includes(u));
  if (illegalFavicon.length > 0) {
    reasons.push(
      `favicon 请求集合超出允许范围：{${faviconSet.join(', ')}} ⊄ {${budget.allowedFavicon.join(', ')}}；` +
        `越界项：${illegalFavicon.join(', ')}`,
    );
  } else if (faviconSet.length === 0) {
    // 空集是"没测到"，不是"通过了"。Chrome 对简页不一定会去取 favicon（已实测），
    // 如实标注为警告，避免这项断言静默空转却看起来是绿的。
    warnings.push(
      'favicon 请求集合为空：浏览器本次未发起 favicon 请求，该项断言空转（未验证，不等于通过）',
    );
  }

  if (measurement.runtimeBytes > budget.thresholdBytes) {
    const over = measurement.runtimeBytes - budget.thresholdBytes;
    reasons.push(
      `首屏体积超预算：${measurement.runtimeBytes} B > ${budget.thresholdBytes} B，超出 ${over} B ` +
        `(${formatUnits(over).kib})`,
    );
  }

  if (reasons.length > 0) return { code: EXIT.OVER, reasons, warnings };

  const headroom = budget.thresholdBytes - measurement.runtimeBytes;
  warnings.push(
    headroom === 0
      ? '恰好等于阈值（0 余量）：下一次任何上升都会红'
      : `余量 ${headroom} B（${((headroom / budget.thresholdBytes) * 100).toFixed(2)}%）`,
  );
  return { code: EXIT.PASS, reasons, warnings };
};
