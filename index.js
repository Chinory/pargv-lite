"use strict";
module.exports = function parse (argv, i, module, moduleName, moduleModel, callback) {
  var optSet = {}, optReset = {}, opt, optUndone, key, keyUnnamed, value, def, opts, j;
  for (key in moduleModel) {
    value = moduleModel[key], def = value.def;
    if (Array.isArray(def)) {
      module[key] = def.slice();
      if ((opts = value.set)) for (j = 0; j < opts.length; ++j) if ((opt = opts[j]) !== "--") optSet[opt] = key; else keyUnnamed = key; 
      if ((opts = value.reset)) for (j = 0; j < opts.length; ++j) if ((opt = opts[j]) !== "--") optReset[opt] = key;
    } else if (def !== null && typeof def === "object") {
      module[key] = null;
      if ((opts = value.set)) for (j = 0; j < opts.length; ++j) if ((opt = opts[j]) !== "--") optSet[opt] = key;
    } else {
      module[key] = def;
      if ((opts = value.set)) for (j = 0; j < opts.length; ++j) if ((opt = opts[j]) !== "--") optSet[opt] = key;
      if ((opts = value.reset)) for (j = 0; j < opts.length; ++j) if ((opt = opts[j]) !== "--") optReset[opt] = key;
    }
  } opts = undefined;
  for (var arg; i < argv.length; ++i) {
    arg = argv[i];
    if (optUndone) {
      key = optSet[optUndone];
      if (Array.isArray(module[key])) module[key].push(arg); else module[key] = arg;
      optUndone = "";
    } else if (arg[0] !== "-" || arg === "-") {
      if ((key = optSet[arg])) {
        def = moduleModel[key].def;
        if (Array.isArray(def)) optUndone = arg;
        else if (def !== null && typeof def === "object") {
          if (!callback("", "", module, moduleName, moduleModel)) return;
          return parse(argv, i + 1, module[key] = {}, key, def, callback);
        } else if (typeof def === "boolean") module[key] = !def;
        else optUndone = arg;
      } else if ((key = optReset[arg])) {
        def = moduleModel[key].def;
        module[key] = Array.isArray(def) ? def.slice() : def;
      } else if (keyUnnamed) {
        module[keyUnnamed].push(arg);
      } else if (!callback("uncaptured argument", arg, module, moduleName, moduleModel)) {
        return;
      }
    } else if (arg === "--") {
      if (keyUnnamed) {
        for (++i; i < argv.length; ++i) module[keyUnnamed].push(argv[i]);
      } else if (!callback("can not set unnamed arguments", "--", module, moduleName, moduleModel)) {
        return;
      }
    } else if (arg[1] === "-") {
      var eq = arg.indexOf("=");
      if (~eq) {
        opt = arg.slice(0, eq), value = arg.slice(eq + 1);
        if ((key = optSet[opt])) {
          def = moduleModel[key].def;
          if (Array.isArray(def)) module[key].push(value);
          else if (def !== null && typeof def === "object") {
            if (!callback("can not set value of module option", opt, module, moduleName, moduleModel)) return;
          } else if (typeof def === "boolean") {
            if (!callback("can not set value of boolean option", opt, module, moduleName, moduleModel)) return;
          } else module[key] = value;
        } else if (optReset[opt]) {
          if (!callback("can not set value of reset option", opt, module, moduleName, moduleModel)) return;
        } else if (keyUnnamed) {
          module[keyUnnamed].push(arg);
        } else if (!callback("uncaptured argument", arg, module, moduleName, moduleModel)) {
          return;
        }
      } else if ((key = optSet[arg])) {
        def = moduleModel[key].def;
        if (Array.isArray(def)) optUndone = arg;
        else if (def !== null && typeof def === "object") {
          if (!callback("", "", module, moduleName, moduleModel)) return;
          return parse(argv, i + 1, module[key] = {}, key, def, callback);
        } else if (typeof def === "boolean") module[key] = !def;
        else optUndone = arg;
      } else if ((key = optReset[arg])) {
        def = moduleModel[key].def;
        module[key] = Array.isArray(def) ? def.slice() : def;
      } else if (keyUnnamed) {
        module[keyUnnamed].push(arg);
      } else if (!callback("uncaptured argument", arg, module, moduleName, moduleModel)) {
        return;
      }
    } else single: {
      var last = arg.length - 1;
      for (j = 1; j < last; ++j) { 
        opt = "-" + arg[j];
        if ((key = optSet[opt])) {
          def = moduleModel[key].def;
          if (Array.isArray(def)) {
            module[key].push(arg.slice(j + 1));
            break single;
          } else if (def !== null && typeof def === "object") {
            if (!callback("", "", module, moduleName, moduleModel)) return;
            argv[i] = "-" + arg.slice(j + 1);
            parse(argv, i, module[key] = {}, key, def, callback);
            argv[i] = arg;
            return;
          } else if (typeof def === "boolean") {
            module[key] = !def;
          } else {
            module[key] = arg.slice(j + 1);
            break single;
          }
        } else if ((key = optReset[opt])) {
          def = moduleModel[key].def;
          module[key] = Array.isArray(def) ? def.slice() : def;
        } else if (!callback("invaild option", opt, module, moduleName, moduleModel)) {
          return;
        }
      }
      opt = "-" + arg[last];
      if ((key = optSet[opt])) {
        def = moduleModel[key].def;
        if (Array.isArray(def)) optUndone = opt;
        else if (def !== null && typeof def === "object") {
          if (!callback("", "", module, moduleName, moduleModel)) return;
          return parse(argv, i + 1, module[key] = {}, key, def, callback);
        } else if (typeof def === "boolean") module[key] = !def;
        else optUndone = opt;
      } else if ((key = optReset[opt])) {
        def = moduleModel[key].def;
        module[key] = Array.isArray(def) ? def.slice() : def;
      } else if (!callback("invaild option", opt, module, moduleName, moduleModel)) {
        return;
      }
    }
  }
  if (optUndone) if (!callback("lack of argument", optUndone, module, moduleName, moduleModel)) return;
  callback("", "", module, moduleName, moduleModel);
};